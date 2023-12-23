import { Plugin } from "vite";
import { parse } from "es-module-lexer";

import { cutArrayToLastN } from "../utils/common.js";
import { handleGoToSource } from "../../dev-server/init.js";
import { DevToolsServerConfig } from "../../dev-server/config.js";
import { createRouteTreeFromAst, handleDevToolsViteRequest, processPlugins, rewriteTypeFile } from "./utils.js";
import { ActionEvent, LoaderEvent } from "../../dev-server/event-queue.js";
import { writeFile } from "fs/promises";

const routeInfo = new Map<string, { loader: LoaderEvent[]; action: ActionEvent[] }>();

const type = [
  "type Path = Record<string, any> & {",
  "  path: string,",
  "  children?: Array<Path>",
  "}",
  "",
  "type GetParentPath<ParentPath extends string> = ",
  "  ParentPath extends '' ? ",
  "    '' ",
  "    : ParentPath extends '/' ? ",
  "      '/' ",
  "      : `${ParentPath}/`",
  "",
  "type TParam<T extends string> = string & {} | `:${T}`",
  "",
  "type ExtractParams<T extends string> = ",
  "  T extends `${infer Path extends string}:${infer Param extends string}` ",
  "    ? Param extends `${infer NestedParam extends string}/${infer NestedPath extends string}` ",
  "      ? `${Path}${TParam<NestedParam>}/${NestedPath}`",
  "      : `${Path}${TParam<Param>}`",
  "    : T",
  "",
  "type ExtractPath<P extends Path, ParentPath extends string> = {",
  "  [K in keyof P]: K extends 'children' ? ",
  "                    P[K] extends Array<Path> ? ",
  "                      AllRoutes<P[K], `${GetParentPath<ParentPath>}${ExtractParams<P['path']>}`> ",
  "                      : never ",
  "                    : K extends 'path' ? ",
  "                      `${GetParentPath<ParentPath>}${ExtractParams<P[K]>}` ",
  "                      : never ",
  "}[keyof P]",
  "",
  "type AllRoutes<R extends Array<Path>, ParentPath extends string = ''> = {",
  "  [K in keyof R]: ExtractPath<R[K], ParentPath>",
  "}[number]",
];

export const remixDevTools: (args?: {
  pluginDir?: string;
  server?: Omit<DevToolsServerConfig, "wsPort" | "withWebsocket">;
}) => Plugin[] = (args) => {
  const serverConfig = args?.server || {};
  const pluginDir = args?.pluginDir || undefined;
  const plugins = pluginDir ? processPlugins(pluginDir) : [];
  const pluginNames = plugins.map((p) => p.name);
  let port = 5173;
  return [
    {
      name: "remix-typed-navigation",
      apply(config) {
        return config.mode === "development";
      },
      transform(code, id) {
        if (id.includes("virtual:server-entry")) {
          const ast: any = this.parse(code, { sourceType: "module" });
          // Server runtime to output the types to (this won't work in mono-repos)
          const serverRuntimeDist = "./node_modules/@remix-run/server-runtime/dist";
          // Router dist to output the types to (could include react-router too);
          const routerDist = "./node_modules/@remix-run/router/dist";
          // Locations of the type files we need to override
          const navigateTypeDefFile = `${routerDist}/history.d.ts`;
          const redirectTypeDefFile = `${serverRuntimeDist}/responses.d.ts`;
          // name of our file that will contain the routes and typing
          const routeFileName = "route-names";
          const typeImport = `import { type Routes } from './${routeFileName}';`;
          // Creates the route object identical to the export from the virtual module.
          const routeTree = createRouteTreeFromAst(ast);
          // Creates the file content
          const routesFileContent = [
            type.join("\n"),
            "\n",
            `const routes = ${JSON.stringify(routeTree, null, 2)} as const satisfies Path[];`,
            "\n",
            `export type Routes = AllRoutes<typeof routes>;`,
          ].join("\n");
          // Outputs the files
          writeFile(`${serverRuntimeDist}/${routeFileName}.ts`, routesFileContent);
          writeFile(`${routerDist}/${routeFileName}.ts`, routesFileContent);

          rewriteTypeFile(
            (file) =>
              file
                .replace("pathname: string;", "pathname: Routes;")
                .replace("export type To = string | Partial<Path>;", "export type To = Routes | Partial<Path>;"),
            navigateTypeDefFile,
            typeImport
          );
          rewriteTypeFile(
            (file) =>
              file.replace(
                "export type RedirectFunction = (url: string",
                "export type RedirectFunction = (url: Routes"
              ),
            redirectTypeDefFile,
            typeImport
          );
        }
        return code;
      },
    },
    {
      enforce: "post",
      name: "remix-development-tools-server",
      apply(config) {
        return config.mode === "development";
      },
      transform(code) {
        if (code.includes("__REMIX_DEVELOPMENT_TOOL_SERVER_PORT__")) {
          const modified = code
            .replaceAll("__REMIX_DEVELOPMENT_TOOL_SERVER_PORT__", port.toString())
            .replaceAll(`singleton("config", () => ({}));`, `(${JSON.stringify(serverConfig)})`);
          return modified;
        }
      },
      configureServer(server) {
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
            server.ws.clients.forEach((client) => {
              client.send("route-info", JSON.stringify({ type, data }));
            });
          })
        );

        server.ws.on("connection", (socket) => {
          socket.on("message", (data) => {
            try {
              const json = JSON.parse(data.toString());
              if (json.type === "custom" && "data" in json) {
                if (json.data.type === "open-source") {
                  handleGoToSource(json.data);
                }
              }

              if (json.event === "all-route-info") {
                server.ws.clients.forEach((client) => {
                  client.send(
                    "all-route-info",
                    JSON.stringify({
                      type: "all-route-info",
                      data: Object.fromEntries(routeInfo.entries()),
                    })
                  );
                });
              }
              // eslint-disable-next-line no-empty
            } catch (e) {}
          });
        });
      },
    },
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
            'import "remix-development-tools/index.css?inline";',
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
