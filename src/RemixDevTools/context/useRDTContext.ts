import { useCallback, useContext, useEffect } from "react";
import { RDTContext, REMIX_DEV_TOOLS } from "./RDTContext";
import { TimelineEvent } from "./timeline";
import { Tabs } from "../tabs";

const useRDTContext = () => {
  const context = useContext(RDTContext);
  if (context === undefined) {
    throw new Error("useRDTContext must be used within a RDTContextProvider");
  }
  const { state, dispatch } = context;
  const { timeline, settings } = state;
  const { activeTab, shouldConnectWithForge } = settings;

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
  const setShouldConnectWithForge = useCallback(
    (shouldConnectWithForge: boolean) => {
      dispatch({
        type: "SET_SHOULD_CONNECT_TO_FORGE",
        payload: shouldConnectWithForge,
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
  };
};

export { useRDTContext };
