import { useNavigation } from "@remix-run/react";
import { useWebSocket } from "../../external/react-use-websocket/use-websocket.js";
import { useEffect } from "react";
import { tryParseJson } from "../utils/sanitize.js";
import { ActionEvent, LoaderEvent, isRdtEventArray } from "../../dev-server/event-queue.js";
import { useDetachedWindowControls, useServerInfo } from "../context/useRDTContext.js";
import { ServerInfo } from "../context/rdtReducer.js";
import { cutArrayToLastN } from "../utils/common.js";

const updateRouteInfo = (
  server: ServerInfo | undefined,
  routes: ServerInfo["routes"],
  event: LoaderEvent | ActionEvent
) => {
  const { data, type } = event;
  const { id, ...rest } = data;
  // Get existing route
  const existingRouteInfo = routes![id] ?? server?.routes?.[id];
  let newRouteData = [...(existingRouteInfo?.[type === "loader" ? "loaders" : "actions"] || []), rest];
  // Makes sure there are no more than 20 entries per loader/action
  newRouteData = cutArrayToLastN(newRouteData, 20);
  // Calculates the min, max and average execution time
  const { min, max, total } = newRouteData.reduce(
    (acc, dataPiece) => {
      return {
        min: Math.min(acc.min, dataPiece.executionTime),
        max: Math.max(acc.max, dataPiece.executionTime),
        total: acc.total + dataPiece.executionTime,
      };
    },
    { min: 100000, max: 0, total: 0 }
  );

  const loaderTriggerCount = existingRouteInfo?.loaderTriggerCount || 0;
  const actionTriggerCount = existingRouteInfo?.actionTriggerCount || 0;
  // Updates the route info with the new data
  routes![id] = {
    ...existingRouteInfo,
    lowestExecutionTime: min,
    highestExecutionTime: max,
    averageExecutionTime: Number(Number(total / newRouteData.length).toFixed(2)),
    loaderTriggerCount: type === "loader" ? loaderTriggerCount + 1 : loaderTriggerCount,
    loaders: type === "loader" ? newRouteData : existingRouteInfo?.loaders ?? [],
    actions: type === "action" ? newRouteData : existingRouteInfo?.actions ?? [],
    lastLoader: type === "loader" ? rest : existingRouteInfo?.lastLoader ?? {},
    lastAction: type === "action" ? rest : existingRouteInfo?.lastAction ?? {},
    actionTriggerCount: type === "action" ? actionTriggerCount + 1 : actionTriggerCount,
  };
};

const useDevServerConnection = (wsPort: number | undefined = 8080) => {
  const navigation = useNavigation();
  const { server, setServerInfo } = useServerInfo();
  const { detachedWindow } = useDetachedWindowControls();

  const methods = useWebSocket(
    `ws://localhost:${wsPort}`,
    {
      onMessage: (e) => {
        // Do not do anything with
        if (navigation.state !== "idle") return;
        const data = tryParseJson(e.data.toString());

        if (isRdtEventArray(data)) {
          const events = data.data;

          const routes: ServerInfo["routes"] = {};
          for (const event of events) {
            updateRouteInfo(server, routes, event);
            setServerInfo({ routes });
          }
        }
      },
    },
    wsPort !== undefined || detachedWindow
  );

  // Pull the event queue from the server when the page is idle
  useEffect(() => {
    if (navigation.state !== "idle") return;
    // We send a pull & clear event to pull the event queue and clear it
    methods.sendMessage(JSON.stringify({ type: "pull_and_clear", data: {} }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.state]);

  return methods;
};

export { useDevServerConnection };
