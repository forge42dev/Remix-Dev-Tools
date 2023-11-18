import { ServerBuild } from "@remix-run/server-runtime";
import { setSingleton, singleton } from "./singleton.js";
import { WebSocketServer } from "ws";
import { errorLog, successLog } from "./logger.js";
import { augmentLoader } from "./loader.js";
import { augmentAction } from "./action.js";
import { setConfig, type DevToolsServerConfig } from "./config.js";
import chalk from "chalk";
import { tryParseJson } from "../RemixDevTools/utils/sanitize.js";
import { exec } from "child_process";
import { readFileSync } from "fs";
import { hasExtension } from "./utils.js";
import { ServerRouteManifest } from "@remix-run/server-runtime/dist/routes.js";
import { WebSocket } from "vite";

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
export const handleWsMessage = (message: string, client: WebSocket) => {
  const data = tryParseJson(message);

  if (!isWsEventType(data)) return;
  if (data.type === "open-source") {
    const source = data.data.source;
    const line = data.data.line;
    if (hasExtension(source)) return exec(`code -g ${source}:${line}`);
    try {
      readFileSync(source + ".tsx");
      return exec(`code -g ${source}.tsx`);
      // eslint-disable-next-line no-empty
    } catch (e) {}
    try {
      readFileSync(source + ".jsx");
      return exec(`code -g ${source}.jsx`);
    } catch (e) {
      return;
    }
  }
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
};
export const installDevToolsGlobals = (config?: DevToolsServerConfig) => {
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
        handleWsMessage(message.toString(), client);
      });
    });

    ["SIGINT", "SIGTERM"].forEach((event) => {
      process.on(event, () => {
        ws.clients.forEach((client) => {
          client.close();
        });
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
    routes: augmentLoadersAndActions(routes),
  };
};

export const augmentLoadersAndActions = <T extends ServerRouteManifest>(routes: T) => {
  return Object.entries(routes).reduce((acc, [name, route]) => {
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
  }, {});
};
