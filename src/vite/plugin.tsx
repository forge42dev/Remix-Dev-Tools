import { Plugin, normalizePath } from "vite";
import { parse } from "es-module-lexer";
import { cutArrayToLastN } from "../client/utils/common.js";
import { DevToolsServerConfig } from "../server/config.js";
import { checkPath, handleDevToolsViteRequest, processPlugins, } from "./utils.js";
import { ActionEvent, LoaderEvent } from "../server/event-queue.js"; 
import { RdtClientConfig } from "../client/context/RDTContext.js"; 
import chalk from "chalk";
import path from 'path';
import fs from 'fs';
import { OpenSourceData } from './types.js';
import { exec } from "node:child_process";

declare global {
  interface Window {
    RDT_MOUNTED: boolean;
  }
}

const routeInfo = new Map<string, { loader: LoaderEvent[]; action: ActionEvent[] }>();

type EditorConfig = {
  name: string;
  open(path: string | undefined, lineNumber: string): void;
}

const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  name: "VSCode",
  open: (path: string | undefined, lineNumber: string) => {
    if(!path){
      return;
    }
    exec(`code -g "${normalizePath(path)}${lineNumber}"`);
  }
}


type RemixViteConfig = {
  client?: Partial<RdtClientConfig>;
  server?: DevToolsServerConfig,
  pluginDir?: string;
  includeInProd?: boolean;
  improvedConsole?: boolean;
  /** The directory where the remix app is located. Defaults to the "./app" relative to where vite.config is being defined. */
  remixDir?: string;
  editor?: EditorConfig;
};
 
export const defineRdtConfig = (config: RemixViteConfig) =>  config
 
export const remixDevTools: (args?:RemixViteConfig) => Plugin[] = (args) => {
  const editor = args?.editor ?? DEFAULT_EDITOR_CONFIG;
  const serverConfig = args?.server || {};
  const clientConfig = args?.client || {
    editorName: editor.name,
  };
  const include = args?.includeInProd ?? false; 
  const improvedConsole = args?.improvedConsole ?? true;
  const remixDir = args?.remixDir || "./app";


  const shouldInject = (mode: string | undefined) => mode === "development" || include;
  let port = 5173;
  // Set the server config on the process object so that it can be accessed by the plugin
  if(typeof process !== "undefined"){
    (process as any).rdt_config = serverConfig;
  }
  return [ 
    {
      enforce: "pre",
      name: "remix-development-tools-server",
      apply(config) {
        return config.mode === "development";
      }, 
      transform(code) {
        const RDT_PORT = "__REMIX_DEVELOPMENT_TOOL_SERVER_PORT__";
        if (code.includes(RDT_PORT)) {
          const modified = code.replaceAll(RDT_PORT, port.toString()); 
          return modified;
        }
      },
      async configureServer(server) {
        server.httpServer?.on("listening", () => {
          port = server.config.server.port ?? 5173;
        });
        server.middlewares.use((req, res, next) =>
          handleDevToolsViteRequest(req, res, next, (parsedData) => {
            const { type, data } = parsedData;
            const id = data.id;
            const existingData = routeInfo.get(id);
            if (existingData) {
              if (type === "loader") {
                existingData.loader = cutArrayToLastN([...existingData.loader, data], 30);
              }
              if (type === "action") {
                existingData.action = cutArrayToLastN([...existingData.action, data], 30);
              }
            } else {
              if (type === "loader") {
                routeInfo.set(id, { loader: [data], action: [] });
              }
              if (type === "action") {
                routeInfo.set(id, { loader: [], action: [data] });
              }
            }
            server.hot.channels.forEach((client) => {
              client.send("route-info", JSON.stringify({ type, data }));
            });
          })
        );
        server.hot.on("all-route-info", (data, client) => {
          client.send("all-route-info",  JSON.stringify({
            type: "all-route-info",
            data: Object.fromEntries(routeInfo.entries()),
          }))
        });

        if (!server.config.isProduction) {
          const openInEditor: EditorConfig['open'] = (path: string | undefined, lineNum: string) => {
            if(!path){
              return;
            }

            editor.open(path, lineNum);
          }
         
          server.hot.on("open-source", ({ data }: OpenSourceData) => {
            const { source, line, routeID } = data;
            const lineNum = line ? `:${line}` : "";

            if (source) { 
              return openInEditor(source, lineNum);
            }

            if (routeID) {
              const routePath = path.join(remixDir, routeID);
              const checkedPath = checkPath(routePath);

              if (!checkedPath) return;
              const { type, validPath } = checkedPath;

              const reactExtensions = ["tsx", "jsx"];
              const allExtensions = ["ts", "js", ...reactExtensions];
              const isRoot = routeID === "root";
              const findFileByExtension = (prefix: string, filePaths: string[]) =>{
                const file = filePaths.find(file => allExtensions.some(ext => file === `${prefix}.${ext}`));
                return file
              }

              if (isRoot) {
                if (!fs.existsSync(remixDir)) return;
                const filesInRemixPath = fs.readdirSync(remixDir);
                const rootFile = findFileByExtension("root", filesInRemixPath);
                rootFile && openInEditor(path.join(remixDir, rootFile), lineNum);
                return;
              }

              // If its not the root route, then we find the file or folder in the routes folder
              // We know that the route ID is in the form of "routes/contact" or "routes/user.profile" when is not root
              // so the ID already contains the "routes" segment, so we just need to find the file or folder in the routes folder
              if (type === "directory") {
                const filesInFolderRoute = fs.readdirSync(validPath);
                const routeFile = findFileByExtension("route", filesInFolderRoute);
                routeFile && openInEditor(path.join(remixDir, routeID, routeFile), lineNum);
                return;
              }
              return openInEditor(validPath, lineNum);
            }
          });
        }
      },
    },
    ...(improvedConsole ? [{ 
      name: "better-console-logs",
      enforce: "pre",
      apply(config){
        return config.mode === "development";
      },
      async transform(code, id) {
        // Ignore anything external
        if(id.includes("node_modules") || id.includes("?raw") || id.includes("dist") || id.includes("build") || !id.includes("app")) return;
      
        if(code.includes("console.")) {
          const lines = code.split("\n");
          return lines.map((line, lineNumber) => {
            if(line.trim().startsWith("//") || line.trim().startsWith("/**") || line.trim().startsWith("*")){
              return line;
            }
            // Do not add for arrow functions or return statements
            if(line.replaceAll(" ", "").includes("=>console.") || line.includes("return console.")) {
              return line;
            }
          
            const column = line.indexOf("console.");
            const logMessage = `"${chalk.magenta("LOG")} ${chalk.blueBright(`${id.replace(normalizePath(process.cwd()),"")}:${lineNumber+1}:${column+1}`)}\\n → "`;
            if (line.includes("console.log(")) {
              const newLine = `console.log(${logMessage},`;
              return line.replace("console.log(", newLine);
            }
            else if (line.includes("console.error(")) {
              const newLine = `console.error(${logMessage},`;
              return line.replace("console.error(", newLine);
            }
            return line;
          }).join("\n");
          
        }
      }} satisfies Plugin] : []),
    {
      name: "remix-development-tools", 
      apply(config) { 
        return shouldInject(config.mode);
      }, 
      async configResolved(resolvedViteConfig){
        const remixIndex = resolvedViteConfig.plugins.findIndex(p => p.name === "remix");
        const devToolsIndex = resolvedViteConfig.plugins.findIndex(p => p.name === "remix-development-tools");
      
        if(remixIndex >= 0 && devToolsIndex > remixIndex){
          throw new Error("remixDevTools plugin has to be before the remix plugin!")
        }
         
      },
      async transform(code, id) { 
        const pluginDir = args?.pluginDir || undefined;
          const plugins = pluginDir && process.env.NODE_ENV === "development" ? await processPlugins(pluginDir) : [];
         const pluginNames = plugins.map((p) => p.name);
        // Wraps loaders/actions
        if ((id.includes("virtual:server-entry") || id.includes("virtual:remix/server-build")) && process.env.NODE_ENV === "development") {
          const updatedCode = [
            `import { augmentLoadersAndActions } from "remix-development-tools/server";`,
            code.replace("export const routes =", "const routeModules ="),
            `export const routes = augmentLoadersAndActions(routeModules);`,
          ].join("\n");

          return updatedCode;
        }
        if (id.endsWith("/root.tsx") || id.endsWith("/root.jsx")) {
          const [, exports] = parse(code);
          const exportNames = exports.map((e) => e.n);
          const hasLinksExport = exportNames.includes("links");
          const lines = code.split("\n");
         
          const imports = [
            'import { withViteDevTools } from "remix-development-tools/client";',
            'import rdtStylesheet from "remix-development-tools/client.css?url";', 
            plugins.map((plugin) => `import { ${plugin.name} } from "${plugin.path}";`).join("\n"),
          ];

          const augmentedLinksExport = hasLinksExport
            ? `export const links = () => [...linksExport(), { rel: "stylesheet", href: rdtStylesheet }];`
            : `export const links = () => [{ rel: "stylesheet", href: rdtStylesheet }];`;

          const augmentedDefaultExport = `export default withViteDevTools(AppExport, { config: ${JSON.stringify(clientConfig)}, plugins: [${
             pluginNames.join(
             ","
           )
         }] })();`;
          
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
              return line.replace("export function links", "function linksExport");
            }
            // export { links } from "/app/root.tsx" variant
            if(line.includes("export {") && line.includes("links") && line.includes("/app/root")) { 
              return line.replace("links", "links as linksExport");
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
