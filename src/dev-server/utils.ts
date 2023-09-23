import chalk from "chalk";
import { actionLog, errorLog, infoLog, loaderLog, redirectLog } from "./logger.js";
import { ServerRoute } from "@remix-run/server-runtime/dist/routes.js";
import { DevToolsServerConfig, getConfig } from "./config.js";
import { diffInMs, secondsToHuman } from "./perf.js";
import { DataFunctionArgs } from "@remix-run/server-runtime";

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

export const syncAnalysis =
  (route: Omit<ServerRoute, "children">, type: "action" | "loader", loaderOrAction: (args: any) => Response | {}) =>
  (args: DataFunctionArgs) => {
    const start = performance.now();
    try {
      const response = loaderOrAction(args);
      unAwaited(() => {
        const end = diffInMs(start);
        if (type === "action") {
          actionLog(`${chalk.blueBright(route.id)} triggered - ${chalk.white(`${end} ms`)}`);
        } else {
          loaderLog(`${chalk.blueBright(route.id)} triggered - ${chalk.white(`${end} ms`)}`);
        }
        analyzeHeaders(route, response);
      });
      return response;
    } catch (err: any) {
      errorHandler(route.id, err, true);
    }
  };

export const asyncAnalysis =
  (
    route: Omit<ServerRoute, "children">,
    type: "action" | "loader",
    loaderOrAction: (args: any) => Promise<Response | unknown>
  ) =>
  async (args: DataFunctionArgs) => {
    const start = performance.now();
    const response = loaderOrAction(args);
    response
      .then((response: unknown) => {
        unAwaited(() => {
          const end = diffInMs(start);
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
