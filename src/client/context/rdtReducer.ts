import { TimelineEvent } from "./timeline/types.js";
import type { Tabs } from "../tabs/index.js";
import { Terminal } from "./terminal/types.js";
import { ActionEvent, LoaderEvent } from "../../server/event-queue.js";
import { cutArrayToFirstN } from "../utils/common.js";

export const defaultServerRouteState: ServerRouteInfo = {
  highestExecutionTime: 0,
  lowestExecutionTime: 0,
  averageExecutionTime: 0,
  loaderTriggerCount: 0,
  actionTriggerCount: 0,
  lastAction: {},
  lastLoader: {},
  loaders: [],
  actions: [],
};

export const ROUTE_BOUNDARY_GRADIENTS = {
  sea: "rdt-bg-green-100 rdt-bg-gradient-to-r rdt-from-cyan-500/50 rdt-to-blue-500/50",
  hyper: "rdt-bg-gradient-to-r rdt-from-pink-500 rdt-via-red-500 rdt-to-yellow-500",
  gotham: "rdt-bg-gradient-to-r rdt-from-gray-700 rdt-via-gray-900 rdt-to-black",
  gray: "rdt-bg-gradient-to-r rdt-from-gray-700/50 rdt-via-gray-900/50 rdt-to-black/50",
  watermelon: "rdt-bg-gradient-to-r rdt-from-red-500 rdt-to-green-500",
  ice: "rdt-bg-gradient-to-r rdt-from-rose-100 rdt-to-teal-100",
  silver: "rdt-bg-gradient-to-r rdt-from-gray-100 rdt-to-gray-300",
} as const;

export const RouteBoundaryOptions = Object.keys(ROUTE_BOUNDARY_GRADIENTS) as (keyof typeof ROUTE_BOUNDARY_GRADIENTS)[];
export type RouteWildcards = Record<string, Record<string, string> | undefined>;
export type TriggerPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "middle-left"
  | "middle-right";

export type ServerRouteInfo = {
  actions?: Omit<ActionEvent["data"], "id">[];
  loaders?: Omit<LoaderEvent["data"], "id">[];
  lowestExecutionTime: number;
  highestExecutionTime: number;
  averageExecutionTime: number;
  loaderTriggerCount: number;
  actionTriggerCount: number;
  lastAction: Partial<Omit<ActionEvent["data"], "id">>;
  lastLoader: Partial<Omit<LoaderEvent["data"], "id">>;
};

export type ServerInfo = {
  port?: number;
  routes?: {
    [key: string]: ServerRouteInfo;
  };
};

export type HTMLErrorPrimitive = {
  file: string;
  tag: string;
};

export type HTMLError = {
  child: HTMLErrorPrimitive;
  parent: HTMLErrorPrimitive;
};

export type RemixDevToolsState = {
  timeline: TimelineEvent[];
  terminals: Terminal[];
  settings: {
    /**
     * The live urls to show in the corner which allow you to open the app in a different environment (eg. staging, production)
     * @default []
     */
    liveUrls: { url: string, name: string }[];
    /**
     * The position of the live urls
     * @default "bottom-left"
     */
    liveUrlsPosition: "bottom-left" | "bottom-right" | "top-left" | "top-right";
    /**
     * The route boundary gradient color to use
     * @default "silver"
     */
    editorName: string;
    routeBoundaryGradient: keyof typeof ROUTE_BOUNDARY_GRADIENTS;
    routeWildcards: RouteWildcards;
    activeTab: Tabs;
    shouldConnectWithForge: boolean;
    port: number;
    height: number;
    /**
     * The maximum height of the panel
     * @default 800
     */
    maxHeight: number;
    /**
     * The minimum height of the panel
     * @default 200
     */
    minHeight: number;
    /**
     * Whether the dev tools should be open by default
     * @default false
     */
    defaultOpen: boolean;
    /**
     * Whether the dev tools trigger should be hidden until the user hovers over it
     * @default false
     */
    hideUntilHover: boolean;
    /**
     * The position of the trigger button 
     * @default "bottom-right"
     */
    position: TriggerPosition;
    /**
     * The initial expansion level of the JSON viewer objects
     * @default 0
     */
    expansionLevel: number;
    hoveredRoute: string;
    isHoveringRoute: boolean;
    routeViewMode: "list" | "tree";
    /**
     * The location of the panel once it is open
     * @default "bottom"
     */
    panelLocation: "top" | "bottom";
    withServerDevTools: boolean;
    /**
     * The hotkey to open the dev tools
     * @default "shift+a"
     */
    openHotkey: string;
    /**
     * Whether to require the URL flag to open the dev tools
     * @default false
     */
    requireUrlFlag: boolean;
    /**
     * The URL flag to open the dev tools, used in conjunction with requireUrlFlag (if set to true)
     * @default "rdt"
     */
    urlFlag: string;
  };
  htmlErrors: HTMLError[];
  server?: ServerInfo;
  persistOpen: boolean;
  detachedWindow: boolean;
  detachedWindowOwner: boolean;
};

export const initialState: RemixDevToolsState = {
  timeline: [],
  terminals: [{ id: 0, locked: false, output: [], history: [] }],
  server: undefined,
  settings: {
    liveUrls: [],
    liveUrlsPosition: "bottom-left",
    editorName: "VSCode",
    routeBoundaryGradient: "silver",
    routeWildcards: {},
    activeTab: "page",
    shouldConnectWithForge: false,
    port: 3003,
    height: 400,
    maxHeight: 600,
    minHeight: 200,
    defaultOpen: false,
    hideUntilHover: false,
    position: "bottom-right",
    expansionLevel: 0,
    hoveredRoute: "",
    isHoveringRoute: false,
    routeViewMode: "tree",
    panelLocation: "bottom",
    withServerDevTools: true,
    openHotkey: "shift+a",
    requireUrlFlag: false,
    urlFlag: "rdt",
  },
  htmlErrors: [],
  persistOpen: false,
  detachedWindow: false,
  detachedWindowOwner: false,
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

type SetProcessId = {
  type: "SET_PROCESS_ID";
  payload: {
    terminalId: Terminal["id"];
    processId?: number;
  };
};

type SetDetachedWindowOwner = {
  type: "SET_DETACHED_WINDOW_OWNER";
  payload: boolean;
};

type SetWholeState = {
  type: "SET_WHOLE_STATE";
  payload: RemixDevToolsState;
};

type SetSettings = {
  type: "SET_SETTINGS";
  payload: Partial<RemixDevToolsState["settings"]>;
};

type PurgeTimeline = {
  type: "PURGE_TIMELINE";
  payload: undefined;
};

type SetIsSubmittedAction = {
  type: "SET_IS_SUBMITTED";
  payload: any;
};

type SetPersistOpenAction = {
  type: "SET_PERSIST_OPEN";
  payload: boolean;
};

type SetServerInfo = {
  type: "SET_SERVER_INFO";
  payload: ServerInfo;
};

type SetHtmlErrors = {
  type: "SET_HTML_ERRORS";
  payload: HTMLError[];
};


/** Aggregate of all action types */
export type RemixDevToolsActions =
  | SetTimelineEvent
  | ToggleTerminalLock
  | AddOrRemoveTerminal
  | AddTerminalOutput
  | ClearTerminalOutput
  | AddTerminalHistory
  | SetProcessId
  | PurgeTimeline
  | SetSettings
  | SetWholeState
  | SetDetachedWindowOwner
  | SetIsSubmittedAction
  | SetServerInfo
  | SetHtmlErrors
  | SetPersistOpenAction;

export const rdtReducer = (
  state: RemixDevToolsState = initialState,
  { type, payload }: RemixDevToolsActions
): RemixDevToolsState => {
  switch (type) {
    case "SET_DETACHED_WINDOW_OWNER":
      return {
        ...state,
        detachedWindowOwner: payload,
      };
    case "SET_HTML_ERRORS":
      return {
        ...state,
        htmlErrors: [...payload],
      };
    case "SET_SERVER_INFO":
      return {
        ...state,
        server: payload,
      };
    case "SET_SETTINGS":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...payload,
        },
      };
    case "SET_TIMELINE_EVENT":
      return {
        ...state,
        timeline: cutArrayToFirstN([payload, ...state.timeline], 30),
      };

    case "SET_WHOLE_STATE": {
      return {
        ...payload,
      };
    }

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
      const terminalExists = state.terminals.some((terminal) => terminal.id === payload);
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

    case "SET_PERSIST_OPEN":
      return {
        ...state,
        persistOpen: payload,
      };
    default:
      return state;
  }
};
