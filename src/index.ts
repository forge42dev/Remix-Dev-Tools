import { useRemixForgeSocket, initClient, initServer, RemixDevTools } from "./RemixDevTools";
import { type Tab } from "./RemixDevTools/tabs";

export type Plugin = (...args: any) => Tab;

export { useRemixForgeSocket, initClient, initServer };
export default RemixDevTools;
