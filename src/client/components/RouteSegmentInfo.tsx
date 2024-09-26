import { UIMatch } from "@remix-run/router";
import { parseCacheControlHeader } from "../../server/parser.js";
import { useServerInfo, useSettingsContext } from "../context/useRDTContext.js";
import { isLayoutRoute } from "../utils/routing.js";
import { CacheInfo } from "./CacheInfo.js";
import { EditorButton } from './EditorButton.js';
import { JsonRenderer } from "./jsonRenderer.js";
import { ServerRouteInfo, defaultServerRouteState } from "../context/rdtReducer.js";
import { InfoCard } from "./InfoCard.js";
import { useDevServerConnection } from "../hooks/useDevServerConnection.js";
import { Icon } from "./icon/Icon.js";
import clsx from "clsx";
import { OpenSourceData } from "../../vite/editor.js";

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
  GREEN: "bg-green-500 ring-green-500 text-white",
  BLUE: "bg-blue-500 ring-blue-500 text-white",
  TEAL: "bg-teal-400 ring-teal-400 text-white",
  RED: "bg-red-500 ring-red-500 text-white",
  PURPLE: "bg-purple-500 ring-purple-500 text-white",
} as const;

export const RouteSegmentInfo = ({ route, i }: { route: UIMatch<unknown, unknown>; i: number }) => {
  const { server, setServerInfo } = useServerInfo();
  const { isConnected, sendJsonMessage } = useDevServerConnection();
  const loaderData = getLoaderData(route.data as any);
  const serverInfo = server?.routes?.[route.id];
  const isRoot = route.id === "root";
  const { setSettings, settings } = useSettingsContext();
  const editorName = settings.editorName;
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
      className="mb-8 ml-8"
    >
      <div
        className={clsx(
          "absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full",
          ROUTE_COLORS[isRoot ? "PURPLE" : isLayout ? "BLUE" : "GREEN"]
        )}
      >
        <Icon name={isRoot ? "Root" : isLayout ? "Layout" : "CornerDownRight"} size="sm" />
      </div>
      <h2 className="text-md -mt-3 mb-1 text-white flex items-center justify-between gap-2 font-semibold text-white">
        {route.pathname}

        <div className="flex gap-2">
          {cacheControl && serverInfo?.lastLoader.timestamp && (
            <CacheInfo
              key={JSON.stringify(serverInfo?.lastLoader ?? "")}
              cacheControl={cacheControl}
              cacheDate={new Date(serverInfo?.lastLoader.timestamp ?? "")}
            />
          )}
          {isConnected && import.meta.env.DEV && (
            <EditorButton
              name={editorName}
              onClick={() =>
                sendJsonMessage({
                  type: "open-source",
                  data: { routeID: route.id },
                } satisfies OpenSourceData)
              }
            />
          )}
        </div>
      </h2>
      <div className="mb-4">
        <p className="mb-2 block text-sm font-normal leading-none text-gray-500  ">
          Route segment file: {route.id}
        </p>

        <div className="flex flex-wrap gap-6">
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
