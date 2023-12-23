import fs, { readFile } from "fs";
import { join } from "path";
import { IncomingMessage, ServerResponse } from "http";
import { Connect } from "vite";
import { Route, RouteManifest } from "@remix-run/server-runtime/dist/routes.js";
import { writeFile } from "fs/promises";

export function processPlugins(pluginDirectoryPath: string) {
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

export const handleDevToolsViteRequest = (
  req: Connect.IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  next: Connect.NextFunction,
  cb: (data: any) => void
) => {
  if (!req.url?.includes("remix-dev-tools")) {
    return next();
  }

  const chunks: any[] = [];
  req.on("data", (chunk) => {
    chunks.push(chunk);
  });
  req.on("end", () => {
    const dataToParse = Buffer.concat(chunks);
    const parsedData = JSON.parse(dataToParse.toString());
    cb(parsedData);
    res.write("OK");
  });
};

interface RouteTree {
  id: string;
  children?: RouteTree[];
}

const constructTree = (routes: Record<string, Route>, parentId?: string): RouteTree[] => {
  const nodes: RouteTree[] = [];
  Object.keys(routes).forEach((key) => {
    const route = routes[key];
    if (route.parentId === parentId) {
      const node: RouteTree = {
        ...route,
        children: constructTree(routes, route.id),
      };
      nodes.push(node);
    }
  });
  return nodes;
};

export const createRouteTree = (routes: RouteManifest<Route>) => constructTree(routes);

export const createRouteTreeFromAst = (ast: any) => {
  const namedExports = ast.body.filter((n: any) => n.type === "ExportNamedDeclaration");
  // The properties exist but they are typed as they didn't exist
  const routeExportNode = namedExports.find((n: any) => n.declaration?.declarations?.[0]?.id?.name === "routes");
  // This gets the value of the object declaration (eg: const routes = { type: "" }) gets { type: "" }
  const routeExportValue = routeExportNode?.declaration?.declarations?.[0].init;
  // This creates an array of objects with the properties of the object declaration
  const routeExportProperties = routeExportValue?.properties
    .map((p: any) => {
      // This gets the key and the value and creates an object out of the AST, eg: { key: "type", value: "module" }
      const keyValuePairs: { key: string; value: string }[] = p?.value?.properties?.map((p: any) => {
        return {
          key: p?.key?.name,
          value: p?.value?.value === "" ? "/" : p?.value?.value,
        };
      });
      // This creates a route object out of the key value pairs, eg: { type: "module" }
      const route = Object.fromEntries(keyValuePairs.map((v: { key: string; value: string }) => [v.key, v.value]));
      // Get only the routes with actual path segments
      if (route.path === undefined) {
        return undefined;
      }
      return route;
    })
    .filter(Boolean);
  // Converts the array of route objects into an object with the id as the key, eg: { "/": { type: "module", path: "blah" } }
  const routes = Object.fromEntries(routeExportProperties.map((p: any) => [p.id, p]));
  // Creates a tree out of the routes object
  const routeTree = createRouteTree(routes);

  return routeTree;
};
export const rewriteTypeFile = (fileRewriter: (file: string) => string, path: string, typeImport: string) => {
  readFile(path, (err, data) => {
    if (err) {
      return;
    }
    const file = data.toString();
    const hasImport = file.includes(typeImport);
    if (hasImport) {
      return;
    }
    const newFile = typeImport + "\n" + fileRewriter(file);

    writeFile(path, newFile);
  });
};
