import { singleton } from "./singleton.js";

export interface DevToolsServerConfig {
  wsPort?: number;
  withWebsocket?: boolean;
  silent?: boolean;
  logs?: {
    cookies?: boolean;
    defer?: boolean;
    actions?: boolean;
    loaders?: boolean;
    cache?: boolean;
    siteClear?: boolean;
  };
}

export const defineServerConfig = (config: DevToolsServerConfig) => config;
export const setConfig = (config?: DevToolsServerConfig) => singleton("config", () => config ?? {});
export const getConfig = () => singleton("config", () => ({}) as DevToolsServerConfig);
