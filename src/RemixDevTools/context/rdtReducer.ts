import { TimelineEvent } from "./timeline";
import type { Tabs } from "../tabs";
import { Terminal } from "./terminal";

export type RouteWildcards = Record<string, Record<string, string> | undefined>;

export type RemixDevToolsState = {
  timeline: TimelineEvent[];
  showRouteBoundaries?: boolean;
  terminals: Terminal[];
  settings: {
    routeWildcards: RouteWildcards;
    activeTab: Tabs;
    shouldConnectWithForge: boolean;
    port: number;
    height: number;
    maxHeight: number;
    minHeight: number;
  };
  persistOpen: boolean;
};

export const initialState: RemixDevToolsState = {
  timeline: [],
  showRouteBoundaries: false,
  terminals: [{ id: 0, locked: false, output: [], history: [] }],
  settings: {
    routeWildcards: {},
    activeTab: "page",
    shouldConnectWithForge: false,
    port: 3003,
    height: 400,
    maxHeight: 600,
    minHeight: 200,
  },
  persistOpen: false,
};

export type ReducerActions = Pick<RemixDevToolsActions, "type">["type"];

/** Reducer action types */
type SetTimelineEvent = {
  type: "SET_TIMELINE_EVENT";
  payload: TimelineEvent;
};

type ToggleTerminalLock = {
  type: "TOGGLE_TERMINAL_LOCK";
  payload: {
    terminalId: Terminal["id"];
    locked?: boolean;
  };
};

type AddOrRemoveTerminal = {
  type: "ADD_OR_REMOVE_TERMINAL";
  payload?: Terminal["id"];
};

type AddTerminalOutput = {
  type: "ADD_TERMINAL_OUTPUT";
  payload: {
    terminalId: Terminal["id"];
    output: Terminal["output"][number];
  };
};

type AddTerminalHistory = {
  type: "ADD_TERMINAL_HISTORY";
  payload: {
    terminalId: Terminal["id"];
    history: Terminal["history"][number];
  };
};

type ClearTerminalOutput = {
  type: "CLEAR_TERMINAL_OUTPUT";
  payload: Terminal["id"];
};

type SetActiveTab = {
  type: "SET_ACTIVE_TAB";
  payload: Tabs;
};

type SetProcessId = {
  type: "SET_PROCESS_ID";
  payload: {
    terminalId: Terminal["id"];
    processId?: number;
  };
};
type SetDevToolsHeight = {
  type: "SET_HEIGHT";
  payload: number;
};

type SetRouteWildcards = {
  type: "SET_ROUTE_WILDCARDS";
  payload: RouteWildcards;
};

type PurgeTimeline = {
  type: "PURGE_TIMELINE";
  payload: undefined;
};

type SetIsSubmittedAction = {
  type: "SET_IS_SUBMITTED";
  payload: any;
};

type SetShouldConnectToForgeAction = {
  type: "SET_SHOULD_CONNECT_TO_FORGE";
  payload: boolean;
};

type SetPersistOpenAction = {
  type: "SET_PERSIST_OPEN";
  payload: boolean;
};

/** Aggregate of all action types */
export type RemixDevToolsActions =
  | SetTimelineEvent
  | ToggleTerminalLock
  | AddOrRemoveTerminal
  | AddTerminalOutput
  | ClearTerminalOutput
  | AddTerminalHistory
  | SetActiveTab
  | SetProcessId
  | PurgeTimeline
  | SetRouteWildcards
  | SetDevToolsHeight
  | SetShouldConnectToForgeAction
  | SetIsSubmittedAction
  | SetPersistOpenAction;

export const rdtReducer = (
  state: RemixDevToolsState = initialState,
  { type, payload }: RemixDevToolsActions
): RemixDevToolsState => {
  switch (type) {
    case "SET_TIMELINE_EVENT":
      return {
        ...state,
        timeline: [payload, ...state.timeline],
      };
    case "SET_ACTIVE_TAB":
      return {
        ...state,
        settings: {
          ...state.settings,
          activeTab: payload,
        },
      };
    case "PURGE_TIMELINE":
      return {
        ...state,
        timeline: [],
      };
    case "SET_IS_SUBMITTED":
      return {
        ...state,
        ...payload,
        isSubmitted: true,
      };
    case "SET_ROUTE_WILDCARDS":
      return {
        ...state,
        settings: {
          ...state.settings,
          routeWildcards: payload,
        },
      };
    case "SET_HEIGHT":
      return {
        ...state,
        settings: {
          ...state.settings,
          height: payload,
        },
      };
    case "SET_PROCESS_ID":
      return {
        ...state,
        terminals: state.terminals.map((terminal) => {
          if (terminal.id === payload.terminalId) {
            return {
              ...terminal,
              processId: payload.processId,
            };
          }
          return terminal;
        }),
      };
    case "TOGGLE_TERMINAL_LOCK":
      return {
        ...state,
        terminals: state.terminals.map((terminal) => {
          if (terminal.id === payload.terminalId) {
            return {
              ...terminal,
              locked: payload.locked ?? !terminal.locked,
            };
          }
          return terminal;
        }),
      };
    case "ADD_OR_REMOVE_TERMINAL": {
      const terminalExists = state.terminals.some(
        (terminal) => terminal.id === payload
      );
      if (terminalExists) {
        return {
          ...state,
          terminals: state.terminals
            .filter((terminal) => terminal.id !== payload)
            .map((terminal, i) => ({ ...terminal, id: i })),
        };
      }
      return {
        ...state,
        terminals: [
          ...state.terminals,
          {
            id: state.terminals.length,
            locked: false,
            history: [],
            output: [],
          },
        ],
      };
    }
    case "ADD_TERMINAL_OUTPUT":
      return {
        ...state,
        terminals: state.terminals.map((terminal) => {
          if (terminal.id === payload.terminalId) {
            return {
              ...terminal,
              output: [...terminal.output, payload.output],
            };
          }
          return terminal;
        }),
      };
    case "CLEAR_TERMINAL_OUTPUT":
      return {
        ...state,
        terminals: state.terminals.map((terminal) => {
          if (terminal.id === payload) {
            return {
              ...terminal,
              output: [],
            };
          }
          return terminal;
        }),
      };

    case "ADD_TERMINAL_HISTORY":
      return {
        ...state,
        terminals: state.terminals.map((terminal) => {
          if (terminal.id === payload.terminalId) {
            return {
              ...terminal,
              history: [...terminal.history, payload.history],
            };
          }
          return terminal;
        }),
      };
    case "SET_SHOULD_CONNECT_TO_FORGE":
      return {
        ...state,
        settings: {
          ...state.settings,
          shouldConnectWithForge: payload,
        },
      };
    case "SET_PERSIST_OPEN":
      return {
        ...state,
        persistOpen: payload,
      };
    default:
      return state;
  }
};
