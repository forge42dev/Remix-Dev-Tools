import { useState, useEffect, useCallback } from "react";
import useWebSocket from "react-use-websocket";
import {
  JsonObject,
  Options,
  WebSocketHook,
} from "react-use-websocket/dist/lib/types";

export const useGetSocket = <T extends JsonObject>(options?: Options) => {
  const properties = (useWebSocket as any).default(
    "ws://localhost:8080",
    { ...options, share: true },
    true
  ) as WebSocketHook<T, MessageEvent<any> | null>;
  return properties;
};
