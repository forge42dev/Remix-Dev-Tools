import { UIMatch } from "@remix-run/router";
import { CornerDownRight } from "lucide-react";
import { parseCacheControlHeader } from "../../dev-server/parser.js";
import { useServerInfo, useSettingsContext } from "../context/useRDTContext.js";
import { isLayoutRoute } from "../utils/routing.js";
import { CacheInfo } from "./CacheInfo.js";
import { VsCodeButton } from "./VScodeButton.js";
import { JsonRenderer } from "./jsonRenderer.js";
import { ServerRouteInfo, defaultServerRouteState } from "../context/rdtReducer.js";
import { Tag } from "./Tag.js";
import { InfoCard } from "./InfoCard.js";
import { useDevServerConnection } from "../hooks/useDevServerConnection.js";

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
    headers: routeInfo.headers,
    ...(routeInfo.headers?.["cache-control"] && {
      cacheInfo: { ...parseCacheControlHeader(new Headers(routeInfo.headers)) },
    }),
  };
};

const cleanServerInfo = (routeInfo: ServerRouteInfo) => {
  return {
    loaderTriggerCount: routeInfo.loaderTriggerCount,
    actionTriggerCount: routeInfo.actionTriggerCount,
    lastLoaderInfo: cleanupLoaderOrAction(routeInfo.lastLoader),
    ...(routeInfo.lastAction && {
      lastActionInfo: cleanupLoaderOrAction(routeInfo.lastAction),
    }),
    lowestExecutionTime: `${routeInfo.lowestExecutionTime}ms`,
    highestExecutionTime: `${routeInfo.highestExecutionTime}ms`,
    averageExecutionTime: `${routeInfo.averageExecutionTime}ms`,
    loaderCalls: routeInfo.loaders?.map((loader) => cleanupLoaderOrAction(loader)),
    actionCalls: routeInfo.actions?.map((action) => cleanupLoaderOrAction(action)),
  };
};

export const RouteSegmentInfo = ({ route, i }: { route: UIMatch<unknown, unknown>; i: number }) => {
  const { server, setServerInfo } = useServerInfo();
  const { isConnected, sendJsonMessage } = useDevServerConnection();
  const loaderData = getLoaderData(route.data as any);
  const serverInfo = server?.routes?.[route.id];
  const isRoot = route.id === "root";
  const { setSettings } = useSettingsContext();
  const cacheControl = parseCacheControlHeader(new Headers(serverInfo?.lastLoader.headers));
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
      <span className="rdt-absolute -rdt-left-3 rdt-mt-2 rdt-flex rdt-h-6 rdt-w-6 rdt-items-center rdt-justify-center rdt-rounded-full rdt-bg-blue-900 rdt-ring-4 rdt-ring-blue-900  ">
        <CornerDownRight />
      </span>
      <h3 className="-rdt-mt-3 rdt-mb-1 rdt-flex rdt-items-center rdt-gap-2 rdt-text-lg rdt-font-semibold rdt-text-white">
        {route.pathname}
        <Tag color={isRoot ? "PURPLE" : isLayout ? "BLUE" : "GREEN"}>
          {isRoot ? "ROOT" : isLayout ? "LAYOUT" : "ROUTE"}
        </Tag>
        {isConnected && (
          <VsCodeButton
            onClick={() =>
              sendJsonMessage({
                type: "open-source",
                data: { source: `app/${route.id}` },
              })
            }
          />
        )}
        {cacheControl && serverInfo?.lastLoader.timestamp && (
          <CacheInfo
            key={JSON.stringify(serverInfo?.lastLoader ?? "")}
            cacheControl={cacheControl}
            cacheDate={new Date(serverInfo?.lastLoader.timestamp ?? "")}
          />
        )}
      </h3>
      <div className="rdt-mb-4">
        <time className="rdt-mb-2 rdt-block rdt-text-sm rdt-font-normal rdt-leading-none rdt-text-gray-500  ">
          Route location: {route.id}
        </time>
        <div className="rdt-flex rdt-gap-3">
          {loaderData && <InfoCard title="Route loader data">{<JsonRenderer data={loaderData} />}</InfoCard>}
          {serverInfo && (
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
