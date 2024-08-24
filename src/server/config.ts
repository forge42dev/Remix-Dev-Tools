import { singleton } from "./singleton.js";

export interface DevToolsServerConfig { 
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
export const getConfig = () => typeof process !== "undefined" ? (process as any).rdt_config : singleton("config", () => ({}));
