import { useCallback, useContext, useEffect } from "react";
import { RDTContext, REMIX_DEV_TOOLS } from "./RDTContext";
import { TimelineEvent } from "./timeline";
import { Tabs } from "../tabs";
import { RouteWildcards } from "./rdtReducer";
import { Terminal } from "./terminal";

const useRDTContext = () => {
  const context = useContext(RDTContext);
  if (context === undefined) {
    throw new Error("useRDTContext must be used within a RDTContextProvider");
  }
  const { state, dispatch } = context;
  const { timeline, settings, showRouteBoundaries, terminals, persistOpen } = state;
  const { activeTab, shouldConnectWithForge, routeWildcards, port, height, maxHeight, minHeight } =
    settings;

  useEffect(() => {
    const reducedState = { ...state };
    delete (reducedState as any).settings;
    const settings = state.settings;
    // Store user settings for dev tools into local storage
    localStorage.setItem(REMIX_DEV_TOOLS, JSON.stringify(settings));
    // Store general state into session storage
    sessionStorage.setItem(REMIX_DEV_TOOLS, JSON.stringify(state));
  }, [state]);

  const setTimelineEvent = useCallback(
    (payload: TimelineEvent) => {
      dispatch({ type: "SET_TIMELINE_EVENT", payload });
    },
    [dispatch]
  );
  const clearTimeline = useCallback(() => {
    dispatch({ type: "PURGE_TIMELINE", payload: undefined });
  }, [dispatch]);
  const setActiveTab = useCallback(
    (activeTab: Tabs) => {
      dispatch({ type: "SET_ACTIVE_TAB", payload: activeTab });
    },
    [dispatch]
  );
  const setRouteWildcards = useCallback(
    (activeTab: RouteWildcards) => {
      dispatch({ type: "SET_ROUTE_WILDCARDS", payload: activeTab });
    },
    [dispatch]
  );
  const addOrRemoveTerminal = useCallback(
    (terminalId?: Terminal["id"]) => {
      dispatch({ type: "ADD_OR_REMOVE_TERMINAL", payload: terminalId });
    },
    [dispatch]
  );

  const toggleTerminalLock = useCallback(
    (terminalId: Terminal["id"], locked?: boolean) => {
      dispatch({
        type: "TOGGLE_TERMINAL_LOCK",
        payload: { terminalId, locked },
      });
    },
    [dispatch]
  );

  const addTerminalOutput = useCallback(
    (terminalId: Terminal["id"], output: Terminal["output"][number]) => {
      dispatch({
        type: "ADD_TERMINAL_OUTPUT",
        payload: { terminalId, output },
      });
    },
    [dispatch]
  );

  const clearTerminalOutput = useCallback(
    (terminalId: Terminal["id"]) => {
      dispatch({ type: "CLEAR_TERMINAL_OUTPUT", payload: terminalId });
    },
    [dispatch]
  );

  const setShouldConnectWithForge = useCallback(
    (shouldConnectWithForge: boolean) => {
      dispatch({
        type: "SET_SHOULD_CONNECT_TO_FORGE",
        payload: shouldConnectWithForge,
      });
    },
    [dispatch]
  );

  const addTerminalHistory = useCallback(
    (terminalId: Terminal["id"], history: Terminal["history"][number]) => {
      dispatch({
        type: "ADD_TERMINAL_HISTORY",
        payload: { terminalId, history },
      });
    },
    [dispatch]
  );
  const setHeight = useCallback(
    (height: number) => {
      dispatch({
        type: "SET_HEIGHT",
        payload: height,
      });
    },
    [dispatch]
  );
  const setProcessId = useCallback(
    (terminalId: Terminal["id"], processId?: number) => {
      dispatch({
        type: "SET_PROCESS_ID",
        payload: { terminalId, processId },
      });
    },
    [dispatch]
  );

  const setPersistOpen = useCallback(
    (persistOpen: boolean) => {
      dispatch({
        type: "SET_PERSIST_OPEN",
        payload: persistOpen,
      });
    },
    [dispatch]
  );

  return {
    setTimelineEvent,
    setActiveTab,
    timeline,
    activeTab,
    clearTimeline,
    setShouldConnectWithForge,
    shouldConnectWithForge,
    routeWildcards,
    port,
    height,
    maxHeight,
    minHeight,
    showRouteBoundaries,
    setHeight,
    setRouteWildcards,
    terminals,
    addOrRemoveTerminal,
    toggleTerminalLock,
    addTerminalOutput,
    clearTerminalOutput,
    addTerminalHistory,
    setProcessId,
    persistOpen,
    setPersistOpen,
  };
};

export { useRDTContext };
