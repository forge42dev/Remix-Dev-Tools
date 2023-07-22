import type { Dispatch } from "react";
import React, { useMemo, createContext, useReducer } from "react";
import {
  RemixDevToolsActions,
  RemixDevToolsState,
  rdtReducer,
  initialState,
} from "./rdtReducer";

export const RDTContext = createContext<{
  state: RemixDevToolsState;
  dispatch: Dispatch<RemixDevToolsActions>;
}>({ state: initialState, dispatch: () => null });

RDTContext.displayName = "RDTContext";

interface ContextProps {
  children: React.ReactNode;
  port: number;
  showRouteBoundaries?: boolean;
}

export const REMIX_DEV_TOOLS = "remixDevTools";

export const RDTContextProvider = ({
  children,
  port,
  showRouteBoundaries,
}: ContextProps) => {
  const existingState = sessionStorage.getItem(REMIX_DEV_TOOLS);
  const settings = localStorage.getItem(REMIX_DEV_TOOLS);

  const [state, dispatch] = useReducer(rdtReducer, {
    ...initialState,
    ...(existingState ? JSON.parse(existingState) : {}),
    showRouteBoundaries,
    settings: settings
      ? { ...initialState.settings, ...JSON.parse(settings), port }
      : { ...initialState.settings, port },
  });

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <RDTContext.Provider value={value}>{children}</RDTContext.Provider>;
};
