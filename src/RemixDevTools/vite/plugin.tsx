import { Plugin } from "vite";
import { parse } from "es-module-lexer";
import fs from "fs";
import { join } from "path";

function processPlugins(pluginDirectoryPath: string) {
  const files = fs.readdirSync(pluginDirectoryPath);
  const allExports: { name: string; path: string }[] = [];
  files.forEach((file) => {
    const filePath = join(pluginDirectoryPath, file);
    const fileCode = fs.readFileSync(filePath, "utf8");
    const lines = fileCode.split("\n");
    lines.forEach((line) => {
      if (line.includes("export const")) {
        const [name] = line.split("export const ")[1].split(" =");
        allExports.push({ name, path: join("..", filePath).replaceAll("\\", "/") });
      }
    });
  });
  return allExports;
}

export const remixDevTools: (args?: { pluginDir?: string }) => Plugin[] = (args) => {
  const pluginDir = args?.pluginDir || undefined;
  const plugins = pluginDir ? processPlugins(pluginDir) : [];
  const pluginNames = plugins.map((p) => p.name);
  return [
    {
      name: "remix-development-tools",
      apply(config) {
        return config.mode === "development";
      },
      transform(code, id) {
        // Wraps loaders/actions
        if (id.includes("virtual:server-entry")) {
          const updatedCode = [
            `import { augmentLoadersAndActions } from "remix-development-tools/server";`,
            code.replace("export const routes =", "const routeModules ="),
            `export const routes = augmentLoadersAndActions(routeModules);`,
          ].join("\n");

          return updatedCode;
        }
        if (id.includes("root.tsx")) {
          const [, exports] = parse(code);
          const exportNames = exports.map((e) => e.n);
          const hasLinksExport = exportNames.includes("links");
          const lines = code.split("\n");
          const imports = [
            'import { withViteDevTools } from "remix-development-tools";',
            'import rdtStylesheet from "remix-development-tools/index.css?url";',
            plugins.map((plugin) => `import { ${plugin.name} } from "${plugin.path}";`).join("\n"),
          ];

          const augmentedLinksExport = hasLinksExport
            ? `export const links = () => [...linksExport(), { rel: "stylesheet", href: rdtStylesheet }];`
            : `export const links = () => [{ rel: "stylesheet", href: rdtStylesheet }];`;

          const augmentedDefaultExport = `export default withViteDevTools(AppExport, { plugins: [${pluginNames.join(
            ","
          )}] })();`;

          const updatedCode = lines.map((line) => {
            // Handles default export augmentation
            if (line.includes("export default function")) {
              const exportName = line.split("export default function ")[1].split("(")[0].trim();
              const newLine = line.replace(`export default function ${exportName}`, `function AppExport`);
              return newLine;
            } else if (line.includes("export default")) {
              const newline = line.replace("export default", "const AppExport =");
              return newline;
            }
            // Handles links export augmentation
            if (line.includes("export const links")) {
              return line.replace("export const links", "const linksExport");
            }
            if (line.includes("export let links")) {
              return line.replace("export let links", "const linksExport");
            }
            if (line.includes("export function links")) {
              return line.replace("export function links", "const linksExport");
            }
            return line;
          });
          // Returns the new code
          return [...imports, ...updatedCode, augmentedLinksExport, augmentedDefaultExport].join("\n");
        }
      },
    },
  ];
};
