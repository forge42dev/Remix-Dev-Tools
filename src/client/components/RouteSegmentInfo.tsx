import { UIMatch } from "react-router";
import { parseCacheControlHeader } from "../../server/parser.js";
import { useServerInfo, useSettingsContext } from "../context/useRDTContext.js";
import { isLayoutRoute } from "../utils/routing.js";
import { CacheInfo } from "./CacheInfo.js";
import { VsCodeButton } from "./VScodeButton.js";
import { JsonRenderer } from "./jsonRenderer.js";
import { ServerRouteInfo, defaultServerRouteState } from "../context/rdtReducer.js";

import { InfoCard } from "./InfoCard.js";
import { useDevServerConnection } from "../hooks/useDevServerConnection.js";
import { Icon } from "./icon/Icon.js";
import clsx from "clsx";

const getLoaderData = (data: string | Record<string, any>) => {
  if (typeof data === "string") {
    try {
      const temp = JSON.parse(data);

      return JSON.stringify(temp, null, 2);
    } catch (e) {
      return data;
    }
  }
  return data;
};

const cleanupLoaderOrAction = (routeInfo: ServerRouteInfo["lastLoader"]) => {
  if (!Object.keys(routeInfo).length) return {};
  return {
    executionTime: `${routeInfo.executionTime}ms`,
    requestData: routeInfo.requestData,
    requestHeaders: routeInfo.requestHeaders,
    responseHeaders: routeInfo.responseHeaders,
    ...(routeInfo.responseHeaders?.["cache-control"] && {
      cacheInfo: { ...parseCacheControlHeader(new Headers(routeInfo.responseHeaders)) },
    }),
  };
};

const cleanServerInfo = (routeInfo: ServerRouteInfo) => {
  return {
    loaderTriggerCount: routeInfo.loaderTriggerCount,
    actionTriggerCount: routeInfo.actionTriggerCount,
    lowestExecutionTime: `${routeInfo.lowestExecutionTime}ms`,
    highestExecutionTime: `${routeInfo.highestExecutionTime}ms`,
    averageExecutionTime: `${routeInfo.averageExecutionTime}ms`,
    lastLoaderInfo: cleanupLoaderOrAction(routeInfo.lastLoader),
    ...(routeInfo.lastAction && {
      lastActionInfo: cleanupLoaderOrAction(routeInfo.lastAction),
    }),

    loaderCalls: routeInfo.loaders?.map((loader) => cleanupLoaderOrAction(loader)).reverse(),
    actionCalls: routeInfo.actions?.map((action) => cleanupLoaderOrAction(action)).reverse(),
  };
};

export const ROUTE_COLORS = {
  GREEN: "rdt-bg-green-500 rdt-ring-green-500 rdt-text-white",
  BLUE: "rdt-bg-blue-500 rdt-ring-blue-500 rdt-text-white",
  TEAL: "rdt-bg-teal-400 rdt-ring-teal-400 rdt-text-white",
  RED: "rdt-bg-red-500 rdt-ring-red-500 rdt-text-white",
  PURPLE: "rdt-bg-purple-500 rdt-ring-purple-500 rdt-text-white",
} as const;

export const RouteSegmentInfo = ({ route, i }: { route: UIMatch<unknown, unknown>; i: number }) => {
  const { server, setServerInfo } = useServerInfo();
  const { isConnected, sendJsonMessage } = useDevServerConnection();
  const loaderData = getLoaderData(route.data as any);
  const serverInfo = server?.routes?.[route.id];
  const isRoot = route.id === "root";
  const { setSettings } = useSettingsContext();
  const cacheControl = serverInfo?.lastLoader.responseHeaders
    ? parseCacheControlHeader(new Headers(serverInfo?.lastLoader.responseHeaders))
    : undefined;
  const onHover = (path: string, type: "enter" | "leave") => {
    setSettings({
      hoveredRoute: path,
      isHoveringRoute: type === "enter",
    });
  };
  const entryRoute = __remixManifest.routes[route.id];
  const isLayout = isLayoutRoute(entryRoute);

  const clearServerInfoForRoute = () => {
    const newServerInfo = { ...server?.routes };
    newServerInfo[route.id] = defaultServerRouteState;
    setServerInfo({ routes: newServerInfo });
  };

  return (
    <li
      onMouseEnter={() => onHover(route.id === "root" ? "root" : i.toString(), "enter")}
      onMouseLeave={() => onHover(route.id === "root" ? "root" : i.toString(), "leave")}
      className="rdt-mb-8 rdt-ml-8"
    >
      <div
        className={clsx(
          "rdt-absolute -rdt-left-4 rdt-flex rdt-h-8 rdt-w-8 rdt-items-center rdt-justify-center rdt-rounded-full",
          ROUTE_COLORS[isRoot ? "PURPLE" : isLayout ? "BLUE" : "GREEN"]
        )}
      >
        <Icon name={isRoot ? "Root" : isLayout ? "Layout" : "CornerDownRight"} size="sm" />
      </div>
      <h3 className="rdt-text-md -rdt-mt-3 rdt-mb-1 rdt-flex rdt-items-center rdt-justify-between rdt-gap-2 rdt-font-semibold rdt-text-white">
        {route.pathname}

        <div className="rdt-flex rdt-gap-2">
          {cacheControl && serverInfo?.lastLoader.timestamp && (
            <CacheInfo
              key={JSON.stringify(serverInfo?.lastLoader ?? "")}
              cacheControl={cacheControl}
              cacheDate={new Date(serverInfo?.lastLoader.timestamp ?? "")}
            />
          )}
          {isConnected && import.meta.env.DEV && (
            <VsCodeButton
              onClick={() =>
                sendJsonMessage({
                  type: "open-source",
                  data: { source: `app/${route.id}` },
                })
              }
            />
          )}
        </div>
      </h3>
      <div className="rdt-mb-4">
        <p className="rdt-mb-2 rdt-block rdt-text-sm rdt-font-normal rdt-leading-none rdt-text-gray-500  ">
          Route segment file: {route.id}
        </p>

        <div className="rdt-flex rdt-flex-wrap rdt-gap-6">
          {loaderData && <InfoCard title="Loader data">{<JsonRenderer data={loaderData} />}</InfoCard>}
          {serverInfo && import.meta.env.DEV && (
            <InfoCard onClear={clearServerInfoForRoute} title="Server Info">
              <JsonRenderer data={cleanServerInfo(serverInfo)} />
            </InfoCard>
          )}
          {route.params && Object.keys(route.params).length > 0 && (
            <InfoCard title="Route params">
              <JsonRenderer data={route.params} />
            </InfoCard>
          )}
          {Boolean(route.handle && Object.keys(route.handle).length > 0) && (
            <InfoCard title="Route handle">
              <JsonRenderer data={route.handle as any} />
            </InfoCard>
          )}
        </div>
      </div>
    </li>
  );
};
