import type { Dispatch } from "react";
import React, { useMemo, createContext, useReducer } from "react";
import { RemixDevToolsActions, RemixDevToolsState, rdtReducer, initialState } from "./rdtReducer";
import { useRemoveBody } from "../hooks/detached/useRemoveBody";
import { useListenToRouteChange } from "../hooks/detached/useListenToRouteChange";
import {
  setSessionItem,
  setStorageItem,
  getStorageItem,
  REMIX_DEV_TOOLS_CHECK_DETACHED,
  REMIX_DEV_TOOLS_DETACHED,
  REMIX_DEV_TOOLS_DETACHED_OWNER,
  REMIX_DEV_TOOLS_SETTINGS,
  REMIX_DEV_TOOLS_STATE,
} from "../utils/storage";
import { checkIsDetachedWindow, checkIsDetached, checkIsDetachedOwner } from "../utils/detached";

export const RDTContext = createContext<{
  state: RemixDevToolsState;
  dispatch: Dispatch<RemixDevToolsActions>;
}>({ state: initialState, dispatch: () => null });

RDTContext.displayName = "RDTContext";

interface ContextProps {
  children: React.ReactNode;
}

export const setIsDetachedIfRequired = () => {
  const isDetachedWindow = checkIsDetachedWindow();
  if (!isDetachedWindow && window.RDT_MOUNTED) {
    setSessionItem(REMIX_DEV_TOOLS_DETACHED, "true");
  }
};

export const resetIsDetachedCheck = () => {
  const isDetachedWindow = checkIsDetachedWindow();
  if (isDetachedWindow && getStorageItem(REMIX_DEV_TOOLS_CHECK_DETACHED) !== "false") {
    setStorageItem(REMIX_DEV_TOOLS_CHECK_DETACHED, "false");
  }
};

export const detachedModeSetup = () => {
  const isDetachedWindow = checkIsDetachedWindow();
  const isDetached = checkIsDetached();
  let isDetachedOwner = checkIsDetachedOwner();
  setIsDetachedIfRequired();
  resetIsDetachedCheck();
  if (isDetachedWindow && !isDetached) {
    window.close();
  }
  if (!isDetached && isDetachedOwner) {
    setSessionItem(REMIX_DEV_TOOLS_DETACHED_OWNER, "false");
    isDetachedOwner = false;
  }
  return {
    detachedWindow: window.RDT_MOUNTED ?? isDetachedWindow,
    detachedWindowOwner: isDetachedOwner,
  };
};

export const getSettings = () => {
  const settings = getStorageItem(REMIX_DEV_TOOLS_SETTINGS);
  return settings
    ? {
        ...initialState.settings,
        ...JSON.parse(settings),
      }
    : { ...initialState.settings };
};

export const getExistingStateFromStorage = (): RemixDevToolsState => {
  const existingState = getStorageItem(REMIX_DEV_TOOLS_STATE);
  const settings = getSettings();
  const { detachedWindow, detachedWindowOwner } = detachedModeSetup();
  return {
    ...initialState,
    ...(existingState ? JSON.parse(existingState) : {}),
    settings,
    detachedWindow,
    detachedWindowOwner,
  };
};

export const RDTContextProvider = ({ children }: ContextProps) => {
  const [state, dispatch] = useReducer(rdtReducer, getExistingStateFromStorage());
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  useListenToRouteChange();
  useRemoveBody(state);
  return <RDTContext.Provider value={value}>{children}</RDTContext.Provider>;
};
