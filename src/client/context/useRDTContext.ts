import { useCallback, useContext } from "react";
import { RDTContext } from "./RDTContext.js";
import { TimelineEvent } from "./timeline/types.js";
import { Terminal } from "./terminal/types.js";
import { RemixDevToolsState } from "./rdtReducer.js";

/**
 * Returns an object containing the current state and dispatch function of the RDTContext.
 * Throws an error if used outside of a RDTContextProvider.
 * - Saves the state to session storage on every state change.
 * - Saves the settings to local storage on every settings state change.
 * @returns {Object} An object containing the following properties:
 *  - dispatch: A function to dispatch actions to the RDTContext reducer.
 *  - state: The current state of the RDTContext.
 */
const useRDTContext = () => {
  const context = useContext(RDTContext);
  if (context === undefined) {
    throw new Error("useRDTContext must be used within a RDTContextProvider");
  }
  const { state, dispatch } = context;
  return {
    dispatch,
    state,
  };
};

export const useHtmlErrors = () => {
  const { state, dispatch } = useRDTContext();
  const { htmlErrors } = state;
  const setHtmlErrors = useCallback(
    (htmlErrors: RemixDevToolsState["htmlErrors"]) => {
      dispatch({
        type: "SET_HTML_ERRORS",
        payload: htmlErrors,
      });
    },
    [dispatch]
  );
  return { htmlErrors, setHtmlErrors };
};

export const useServerInfo = () => {
  const { state, dispatch } = useRDTContext();
  const { server } = state;
  const setServerInfo = useCallback(
    (serverInfo: Partial<RemixDevToolsState["server"]>) => {
      dispatch({
        type: "SET_SERVER_INFO",
        payload: {
          ...server,
          ...serverInfo,
          routes: {
            ...server?.routes,
            ...serverInfo?.routes,
          },
        },
      });
    },
    [dispatch, server]
  );
  return { server, setServerInfo };
};

export const useDetachedWindowControls = () => {
  const { state, dispatch } = useRDTContext();
  const { detachedWindow, detachedWindowOwner } = state;

  const setDetachedWindowOwner = useCallback(
    (isDetachedWindowOwner: boolean) => {
      dispatch({
        type: "SET_DETACHED_WINDOW_OWNER",
        payload: isDetachedWindowOwner,
      });
    },
    [dispatch]
  );

  return {
    detachedWindow: detachedWindow || window.RDT_MOUNTED,
    detachedWindowOwner,
    setDetachedWindowOwner,
    isDetached: detachedWindow || detachedWindowOwner,
  };
};

export const useSettingsContext = () => {
  const { dispatch, state } = useRDTContext();
  const { settings } = state;
  const setSettings = useCallback(
    (settings: Partial<RemixDevToolsState["settings"]>) => {
      dispatch({
        type: "SET_SETTINGS",
        payload: settings,
      });
    },
    [dispatch]
  );
  return { setSettings, settings };
};

export const usePersistOpen = () => {
  const { dispatch, state } = useRDTContext();
  const { persistOpen } = state;
  const setPersistOpen = useCallback(
    (persistOpen: boolean) => {
      dispatch({
        type: "SET_PERSIST_OPEN",
        payload: persistOpen,
      });
    },
    [dispatch]
  );
  return { persistOpen, setPersistOpen };
};
/**
 * Returns an object containing functions and state related to the timeline context.
 * @returns {Object} An object containing the following properties:
 *  - setTimelineEvent: A function that sets a new timeline event.
 *  - timeline: An array of timeline events.
 *  - clearTimeline: A function that clears all timeline events.
 */
export const useTimelineContext = () => {
  const { state, dispatch } = useRDTContext();
  const { timeline } = state;
  const setTimelineEvent = useCallback(
    (payload: TimelineEvent) => {
      dispatch({ type: "SET_TIMELINE_EVENT", payload });
    },
    [dispatch]
  );
  const clearTimeline = useCallback(() => {
    dispatch({ type: "PURGE_TIMELINE", payload: undefined });
  }, [dispatch]);

  return { setTimelineEvent, timeline, clearTimeline };
};

/**
 * Returns an object containing functions and state related to the terminal context.
 * @returns {Object} An object containing the following properties:
 *  - terminals: An array of terminal objects.
 *  - addOrRemoveTerminal: A function that adds or removes a terminal object.
 *  - toggleTerminalLock: A function that toggles the lock state of a terminal object.
 *  - addTerminalOutput: A function that adds output to a terminal object.
 *  - clearTerminalOutput: A function that clears the output of a terminal object.
 *  - addTerminalHistory: A function that adds a command to the history of a terminal object.
 *  - setProcessId: A function that sets the process ID of a terminal object.
 */
export const useTerminalContext = () => {
  const { state, dispatch } = useRDTContext();
  const { terminals } = state;
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

  const addTerminalHistory = useCallback(
    (terminalId: Terminal["id"], history: Terminal["history"][number]) => {
      dispatch({
        type: "ADD_TERMINAL_HISTORY",
        payload: { terminalId, history },
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
  return {
    terminals,
    addOrRemoveTerminal,
    toggleTerminalLock,
    addTerminalOutput,
    clearTerminalOutput,
    addTerminalHistory,
    setProcessId,
  };
};

export { useRDTContext };
