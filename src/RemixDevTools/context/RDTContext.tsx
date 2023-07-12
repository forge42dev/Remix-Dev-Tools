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
}

export const REMIX_DEV_TOOLS = "remixDevTools";

export const RDTContextProvider = ({ children }: ContextProps) => {
  const existingState = sessionStorage.getItem(REMIX_DEV_TOOLS);
  const settings = localStorage.getItem(REMIX_DEV_TOOLS);

  const [state, dispatch] = useReducer(rdtReducer, {
    ...initialState,
    ...(existingState ? JSON.parse(existingState) : {}),
    settings: settings
      ? { ...initialState.settings, ...JSON.parse(settings) }
      : initialState.settings,
  });

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <RDTContext.Provider value={value}>{children}</RDTContext.Provider>;
};
