import { ServerBuild } from "@remix-run/server-runtime";
import { singleton } from "./singleton.js";
import { WebSocketServer } from "ws";
import { successLog } from "./logger.js";
import { augmentLoader } from "./loader.js";
import { augmentAction } from "./action.js";
import { setConfig, type DevToolsServerConfig } from "./config.js";
import chalk from "chalk";

export const augmentIfExists = (property: string, object: Record<string, any>, augment: any) => {
  if (object[property]) {
    return {
      [property]: augment,
    };
  }
  return {};
};

const installDevToolsGlobals = (config?: DevToolsServerConfig) => {
  const ws = singleton("ws", () => {
    if (config?.withWebsocket === false) return;
    const port = config?.wsPort || 8080;
    const ws = new WebSocketServer({ port });
    ["SIGINT", "SIGTERM"].forEach((event) => {
      process.on(event, () => {
        ws.close();
      });
    });

    successLog(`🌍  DevTools Websocket Server started on port ${chalk.green(port)}`);
    return ws;
  });

  return ws;
};

export const withServerDevTools = <T extends ServerBuild>(build: T, config?: DevToolsServerConfig) => {
  setConfig(config);
  installDevToolsGlobals(config);
  const routes = build.routes;
  return {
    ...build,
    routes: Object.entries(routes).reduce((acc, [name, route]) => {
      return {
        ...acc,
        [name]: {
          ...route,
          module: {
            ...route.module,
            ...(route.module.loader ? { loader: augmentLoader(route, route.module.loader as any) } : {}),
            ...(route.module.action ? { action: augmentAction(route, route.module.action as any) } : {}),
          },
        },
      };
    }, {}),
  };
};
