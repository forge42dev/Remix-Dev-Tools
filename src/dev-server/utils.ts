import chalk from "chalk";
import { actionLog, errorLog, infoLog, loaderLog, redirectLog } from "./logger.js";
import { ServerRoute } from "@remix-run/server-runtime/dist/routes.js";
import { DevToolsServerConfig, getConfig } from "./config.js";
import { diffInMs, secondsToHuman } from "./perf.js";
import { DataFunctionArgs } from "@remix-run/server-runtime";
import { getSocket } from "./init.js";
import { storeEvent } from "./event-queue.js";

const analyzeCookies = (route: Omit<ServerRoute, "children">, config: DevToolsServerConfig, headers: Headers) => {
  if (config.logs?.cookies === false) {
    return;
  }
  if (headers.get("Set-Cookie")) {
    infoLog(`🍪 Cookie set by ${chalk.blueBright(route.id)}`);
  }
};

const analyzeCache = (route: Omit<ServerRoute, "children">, config: DevToolsServerConfig, headers: Headers) => {
  if (config.logs?.cache === false) {
    return;
  }
  if (headers.get("Cache-Control")) {
    const cacheDuration = headers
      .get("Cache-Control")
      ?.split(" ")
      .map((x) => x.trim().replace(",", ""));

    const age = cacheDuration?.find((x) => x.includes("max-age"));
    const serverAge = cacheDuration?.find((x) => x.includes("s-maxage"));
    const isPrivate = cacheDuration?.find((x) => x.includes("private"));
    if (age && serverAge && !isPrivate) {
      const duration = serverAge.split("=")[1];
      const durationNumber = isNaN(parseInt(duration)) ? 0 : parseInt(duration);
      return infoLog(
        `📦 Route ${chalk.blueBright(route.id)} cached for ${chalk.green(secondsToHuman(durationNumber))} ${chalk.green(
          "[Shared Cache]"
        )}`
      );
    }
    if (age) {
      const duration = age.split("=")[1];
      const durationNumber = isNaN(parseInt(duration)) ? 0 : parseInt(duration);

      infoLog(
        `📦 Route ${chalk.blueBright(route.id)} cached for ${chalk.green(secondsToHuman(durationNumber))} ${chalk.green(
          `[${isPrivate ? "Private Cache" : "Shared Cache"}]`
        )}`
      );
    }
    if (serverAge) {
      const duration = serverAge.split("=")[1];
      const durationNumber = isNaN(parseInt(duration)) ? 0 : parseInt(duration);
      infoLog(
        `📦 Route ${chalk.blueBright(route.id)} cached for ${chalk.green(secondsToHuman(durationNumber))} ${chalk.green(
          "[Shared Cache]"
        )}`
      );
    }
  }
};

const analyzeClearSite = (route: Omit<ServerRoute, "children">, config: DevToolsServerConfig, headers: Headers) => {
  if (config.logs?.siteClear === false) {
    return;
  }

  if (headers.get("Clear-Site-Data")) {
    const data = headers.get("Clear-Site-Data");
    infoLog(`🧹 Site data cleared by ${chalk.blueBright(route.id)} ${chalk.green(`[${data}]`)}`);
  }
};

export const analyzeHeaders = (route: Omit<ServerRoute, "children">, response: unknown) => {
  if (!(response instanceof Response)) {
    return;
  }
  const headers = new Headers(response.headers);
  const config = getConfig();
  analyzeCookies(route, config, headers);
  analyzeCache(route, config, headers);
  analyzeClearSite(route, config, headers);
};

export const analyzeDeferred = (id: string, start: number, response: any) => {
  const config = getConfig();
  if (config.logs?.defer === false) {
    return;
  }
  if (response && response.deferredKeys) {
    infoLog(`Deferred values detected in ${chalk.blueBright(id)} - ${chalk.white(response.deferredKeys.join(", "))}`);
    response.deferredKeys.map((key: string) => {
      response.data[key].then(() => {
        const end = diffInMs(start);
        infoLog(`Deferred value ${chalk.white(key)} resolved in ${chalk.blueBright(id)} - ${chalk.white(`${end}ms`)}`);
      });
    });
  }
};

export const isAsyncFunction = (fn: (...args: any[]) => any) => {
  return fn.constructor.name === "AsyncFunction";
};

export const unAwaited = async (promise: () => any) => {
  promise();
};

const errorHandler = (routeId: string, e: any, shouldThrow = false) => {
  unAwaited(() => {
    if (e instanceof Response) {
      const headers = new Headers(e.headers);
      const location = headers.get("Location");
      if (location) {
        redirectLog(`${chalk.blueBright(routeId)} threw a response!`);
        redirectLog(`${chalk.blueBright(routeId)} redirected to ${chalk.green(location)}`);
      } else {
        errorLog(`${chalk.blueBright(routeId)} threw a response!`);
        errorLog(`${chalk.blueBright(routeId)} responded with ${chalk.white(e.status)} ${chalk.white(e.statusText)}`);
      }
    } else {
      errorLog(`${chalk.blueBright(routeId)} threw an error!`);
      errorLog(`${e?.message}`);
    }
  });
  if (shouldThrow) {
    throw e;
  }
};
const logTrigger = (id: string, type: "action" | "loader", end: number) => {
  if (type === "action") {
    actionLog(`${chalk.blueBright(id)} triggered - ${chalk.white(`${end} ms`)}`);
  } else {
    loaderLog(`${chalk.blueBright(id)} triggered - ${chalk.white(`${end} ms`)}`);
  }
};

const extractHeadersFromResponseOrRequest = (response: Response | Request): Record<string, string> => {
  const headers = new Headers(response.headers);
  return Object.fromEntries(headers.entries());
};

const extractDataFromResponseOrRequest = async (response: Response | Request): Promise<null | unknown> => {
  const extractable = new Response(response.body, response)
  const headers = new Headers(extractable.headers);
  const contentType = headers.get("Content-Type");
  try {
    if (contentType?.includes("application/json")) {
      return extractable.json();
    }
    if (contentType?.includes("text/html")) {
      return extractable.text();
    }
    if (contentType?.includes("x-www-form-urlencoded")) {
      const formData = await extractable.formData();
      return Object.fromEntries(formData.entries());
    }
  } catch (e) {
    return null;
  }
  return null;
};

const storeAndEmitActionOrLoaderInfo = async (
  type: "action" | "loader",
  route: Omit<ServerRoute, "children">,
  response: unknown,
  end: number,
  args: DataFunctionArgs
) => {
  const isResponse = response instanceof Response;
  const responseHeaders = isResponse ? extractHeadersFromResponseOrRequest(response) : null;
  // create the event
  const event = {
    type,
    data: {
      id: route.id,
      executionTime: end,
      timestamp: new Date().getTime(),
      responseHeaders,
      requestHeaders: extractHeadersFromResponseOrRequest(args.request),
      requestData: await extractDataFromResponseOrRequest(args.request),
    },
  };
  const port =
    // @ts-expect-error
    typeof __REMIX_DEVELOPMENT_TOOL_SERVER_PORT__ === "number" ? __REMIX_DEVELOPMENT_TOOL_SERVER_PORT__ : undefined;
  if (port) {
    fetch(`http://localhost:${port}/remix-dev-tools`, {
      method: "POST",
      body: JSON.stringify(event),
    })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .then(() => {})
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  // TODO: Remove after vite only transition
  // store it into queue
  storeEvent(event);
  const ws = getSocket();
  // send it to consumers
  ws?.clients.forEach((client) => {
    client.send(JSON.stringify(event));
  });
};

export const syncAnalysis =
  (route: Omit<ServerRoute, "children">, type: "action" | "loader", loaderOrAction: (args: any) => any) =>
  (args: DataFunctionArgs) => {
    const start = performance.now();
    try {
      const response = loaderOrAction(args);
      unAwaited(() => {
        const end = diffInMs(start);
        logTrigger(route.id, type, end);
        storeAndEmitActionOrLoaderInfo(type, route, response, end, args);
        analyzeHeaders(route, response);
      });
      return response;
    } catch (err: any) {
      errorHandler(route.id, err, true);
    }
  };

export const asyncAnalysis =
  (route: Omit<ServerRoute, "children">, type: "action" | "loader", loaderOrAction: (args: any) => Promise<any>) =>
  async (args: DataFunctionArgs) => {
    const start = performance.now();
    const response = loaderOrAction(args);
    response
      .then((response: unknown) => {
        unAwaited(() => {
          const end = diffInMs(start);
          storeAndEmitActionOrLoaderInfo(type, route, response, end, args);
          if (type === "action") {
            actionLog(`${chalk.blueBright(route.id)} triggered - ${chalk.white(`${end} ms`)}`);
          } else {
            loaderLog(`${chalk.blueBright(route.id)} triggered - ${chalk.white(`${end} ms`)}`);
          }
          analyzeDeferred(route.id, start, response);
          analyzeHeaders(route, response);
        });
        return response;
      })
      .catch((err) => errorHandler(route.id, err));
    return response;
  };

export const hasExtension = (path: string) =>
  path.endsWith(".tsx") || path.endsWith(".jsx") || path.endsWith(".js") || path.endsWith(".ts");
