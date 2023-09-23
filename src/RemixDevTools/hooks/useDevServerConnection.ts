import { useWebSocket } from "../../external/react-use-websocket/use-websocket.js";

const useDevServerConnection = (wsPort: number | undefined) => {
  return useWebSocket(`ws://localhost:${wsPort}`, {}, wsPort !== undefined);
};

export { useDevServerConnection };
