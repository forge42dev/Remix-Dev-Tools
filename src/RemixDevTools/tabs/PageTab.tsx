import { useMatches, useRevalidator } from "@remix-run/react";
import { CornerDownRight } from "lucide-react";
import clsx from "clsx";
import { JsonRenderer } from "../components/jsonRenderer";
import { useRemixForgeSocket } from "../hooks/useRemixForgeSocket";
import { Tag } from "../components/Tag";
import { VsCodeButton } from "../components/VScodeButton";
import { useMemo } from "react";
import { isLayoutRoute } from "../utils/routing";
import { useSettingsContext } from "../context/useRDTContext";

export const ROUTE_COLORS: Record<string, string> = {
  ROUTE: "rdt-bg-green-500 rdt-text-white",
  LAYOUT: "rdt-bg-blue-500 rdt-text-white",
  ROOT: "rdt-bg-purple-500 rdt-text-white",
};

const getLoaderData = (data: string | Record<string, any>) => {
  if (typeof data === "string") {
    try {
      const temp = JSON.parse(data);
      delete temp.remixDevTools;
      return JSON.stringify(temp, null, 2);
    } catch (e) {
      return data;
    }
  }
  if (data?.remixDevTools) delete data.remixDevTools;
  return data;
};

const getOriginalData = (data: string | Record<string, any>) => {
  if (typeof data === "string") {
    try {
      const val = JSON.parse(data);
      return val;
    } catch (e) {
      return data;
    }
  }
  return data;
};

const PageTab = () => {
  const routes = useMatches();
  const reversed = useMemo(() => routes.reverse(), [routes]);
  const { revalidate, state } = useRevalidator();
  const { isConnected, sendJsonMessage } = useRemixForgeSocket();
  const { setSettings } = useSettingsContext();
  const onHover = (path: string, type: "enter" | "leave") => {
    setSettings({
      hoveredRoute: path,
      isHoveringRoute: type === "enter",
    });
  };

  return (
    <div className="rdt-relative rdt-flex rdt-h-full rdt-flex-col rdt-overflow-y-auto rdt-p-6 rdt-px-6">
      <button
        onClick={() => revalidate()}
        className={clsx(
          "rdt-absolute rdt-right-4 rdt-top-0 rdt-z-20 rdt-cursor-pointer rdt-rounded-lg rdt-bg-green-500 rdt-px-3 rdt-py-1 rdt-text-sm rdt-font-semibold rdt-text-white",
          state !== "idle" && "rdt-pointer-events-none rdt-opacity-50"
        )}
      >
        {state !== "idle" ? "Revalidating..." : "Revalidate"}
      </button>
      <ol
        className={clsx(
          "rdt-relative rdt-border-l rdt-border-gray-700",
          state === "loading" && "rdt-pointer-events-none rdt-opacity-50"
        )}
      >
        {reversed.map((route) => {
          const loaderData = getLoaderData(route.data);
          const originalData = getOriginalData(route.data);

          const isRoot = route.id === "root";

          const entryRoute = __remixManifest.routes[route.id];
          const isLayout = isLayoutRoute(entryRoute);

          return (
            <li
              onMouseEnter={() => onHover(route.id, "enter")}
              onMouseLeave={() => onHover(route.id, "leave")}
              key={route.id}
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
                        type: "open-vscode",
                        data: { route: route.id },
                      })
                    }
                  />
                )}
              </h3>
              <div className="rdt-mb-4">
                <time className="rdt-mb-2 rdt-block rdt-text-sm rdt-font-normal rdt-leading-none rdt-text-gray-500  ">
                  Route location: {route.id}
                </time>
                <div className="rdt-flex rdt-gap-16">
                  {loaderData && (
                    <div className="rdt-mb-4 rdt-max-w-md rdt-overflow-x-hidden rdt-text-base rdt-font-normal rdt-text-gray-400">
                      Route loader data:
                      {<JsonRenderer data={loaderData} />}
                    </div>
                  )}
                  {route.params && Object.keys(route.params).length > 0 && (
                    <div className="rdt-mb-4 rdt-text-base rdt-font-normal  rdt-text-gray-400">
                      Route params:
                      <JsonRenderer data={route.params} />
                    </div>
                  )}
                  {route.handle && Object.keys(route.handle).length > 0 && (
                    <div className="rdt-mb-4 rdt-text-base rdt-font-normal  rdt-text-gray-400">
                      Route handle:
                      <JsonRenderer data={route.handle} />
                    </div>
                  )}
                  {originalData?.remixDevTools?.timers?.length && (
                    <div className="rdt-mb-4 rdt-text-base rdt-font-normal  rdt-text-gray-400">
                      <div className="rdt-mb-1">
                        Registered timers for route:
                      </div>
                      {originalData?.remixDevTools?.timers.map(
                        (timer: { name: string; duration: number }) => {
                          return (
                            <div
                              key={timer.name}
                              className="rdt-flex rdt-justify-between rdt-gap-4 rdt-text-sm rdt-font-normal rdt-text-white"
                            >
                              <div>{timer.name} </div>
                              <div>
                                {(timer.duration / 1000).toPrecision(2)}s (
                                {timer.duration}ms)
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export { PageTab };
