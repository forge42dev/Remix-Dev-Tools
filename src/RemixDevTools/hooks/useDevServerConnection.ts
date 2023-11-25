import { useNavigation } from "@remix-run/react";
import { useWebSocket } from "../../external/react-use-websocket/use-websocket.js";
import { useEffect } from "react";
import { tryParseJson } from "../utils/sanitize.js";
import { ActionEvent, LoaderEvent, isRdtEventArray } from "../../dev-server/event-queue.js";
import { useDetachedWindowControls, useServerInfo, useSettingsContext } from "../context/useRDTContext.js";
import { ServerInfo } from "../context/rdtReducer.js";
import { cutArrayToLastN } from "../utils/common.js";
import { ReadyState } from "../../external/react-use-websocket/constants.js";

const updateRouteInfo = (
  server: ServerInfo | undefined,
  routes: ServerInfo["routes"],
  event: LoaderEvent | ActionEvent,
  includeServerInfo = true
) => {
  const { data, type } = event;
  const { id, ...rest } = data;
  // Get existing route
  const existingRouteInfo = !includeServerInfo ? routes?.[id] : routes![id] ?? server?.routes?.[id];
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

const useDevServerConnection = () => {
  const navigation = useNavigation();
  const { settings } = useSettingsContext();
  const { server, setServerInfo } = useServerInfo();
  const { detachedWindowOwner, isDetached } = useDetachedWindowControls();
  const shouldConnect = isDetached ? detachedWindowOwner && settings.withServerDevTools : settings.withServerDevTools;
  const methods = useWebSocket(
    `ws://localhost:${settings.wsPort}`,
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
    shouldConnect && typeof import.meta.hot === "undefined"
  );

  // Pull the event queue from the server when the page is idle
  useEffect(() => {
    if (typeof import.meta.hot === "undefined") return;
    if (navigation.state !== "idle") return;
    // We send a pull & clear event to pull the event queue and clear it
    methods.sendMessage(JSON.stringify({ type: "pull_and_clear", data: {} }));
    import.meta.hot.send("all-route-info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.state]);

  useEffect(() => {
    const cb2 = (data: any) => {
      const events = JSON.parse(data).data;
      const routes: ServerInfo["routes"] = {};
      Object.values(events).forEach((routeInfo) => {
        const { loader, action } = routeInfo as any;
        const events = [
          loader.map((e: any) => ({ type: "loader", data: e })),
          action.map((e: any) => ({ type: "action", data: e })),
        ].flat();
        for (const event of events) {
          updateRouteInfo(server, routes, event, false);
        }
      });
      setServerInfo({ routes });
    };
    if (typeof import.meta.hot !== "undefined") {
      import.meta.hot.on("all-route-info", cb2);
    }

    return () => {
      if (typeof import.meta.hot !== "undefined") {
        import.meta.hot.dispose(cb2);
      }
    };
  }, [server, setServerInfo]);
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[methods.readyState];
  const isConnected = methods.readyState === ReadyState.OPEN || typeof import.meta.hot !== "undefined";
  const isConnecting = methods.readyState === ReadyState.CONNECTING;

  return {
    ...methods,
    sendJsonMessage: import.meta.hot ? (data: any) => import.meta.hot?.send("custom", data) : methods.sendJsonMessage,
    connectionStatus: import.meta.hot ? "Open" : connectionStatus,
    isConnected,
    isConnecting,
  };
};

export { useDevServerConnection };
