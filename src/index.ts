import { RemixDevTools } from "./RemixDevTools/RemixDevTools.js";
import { type Tab } from "./RemixDevTools/tabs/index.js";
// Named exports
export { useRemixForgeSocket } from "./RemixDevTools/hooks/useRemixForgeSocket.js";
export { initClient, initServer } from "./RemixDevTools/init/project.js";
export { EmbeddedDevTools } from "./RemixDevTools/EmbeddedDevTools.js";
export { RemixDevTools };
// Type exports
export type { EmbeddedDevToolsProps } from "./RemixDevTools/EmbeddedDevTools.js";
export type { RemixDevToolsProps } from "./RemixDevTools/RemixDevTools.js";
export type Plugin = (...args: any) => Tab;

export default RemixDevTools;
