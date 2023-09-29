import { ServerBuild } from "@remix-run/server-runtime";
import { setSingleton, singleton } from "./singleton.js";
import { WebSocketServer } from "ws";
import { errorLog, successLog } from "./logger.js";
import { augmentLoader } from "./loader.js";
import { augmentAction } from "./action.js";
import { setConfig, type DevToolsServerConfig } from "./config.js";
import chalk from "chalk";
import { tryParseJson } from "../RemixDevTools/utils/sanitize.js";

export const augmentIfExists = (property: string, object: Record<string, any>, augment: any) => {
  if (object[property]) {
    return {
      [property]: augment,
    };
  }
  return {};
};

export const getSocket = () => singleton<WebSocketServer | undefined>("rdt-ws", () => undefined);

const isWsEventType = (obj: unknown): obj is { type: string; data: any } => {
  return typeof obj === "object" && obj !== null && "type" in obj && "data" in obj;
};

const installDevToolsGlobals = (config?: DevToolsServerConfig) => {
  const ws = singleton("rdt-ws", () => {
    if (config?.withWebsocket === false) return;

    const port = config?.wsPort || 8080;
    const ws = new WebSocketServer({ port });
    ws.on("listening", () => {
      successLog(`🌍  DevTools Websocket Server started on port ${chalk.green(port)}`);
    });
    ws.on("error", () => {
      errorLog(`🌍  DevTools Websocket Server failed to start, port ${port} already in use!`);
    });
    ws.on("connection", (client) => {
      client.on("message", (message) => {
        const data = tryParseJson(message.toString());
        if (!isWsEventType(data)) return;

        if (data.type === "pull_and_clear") {
          const queue = singleton("rdtEventQueue", () => {
            return [];
          });

          client.send(JSON.stringify({ type: "events", data: queue }));
          setSingleton("rdtEventQueue", []);
        }
        if (data.type === "pull") {
          const queue = singleton("rdtEventQueue", () => {
            return [];
          });

          client.send(JSON.stringify({ type: "events", data: queue }));
        }
      });
    });

    ["SIGINT", "SIGTERM"].forEach((event) => {
      process.on(event, () => {
        ws.close();
      });
    });

    return ws;
  });

  return { ws };
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
