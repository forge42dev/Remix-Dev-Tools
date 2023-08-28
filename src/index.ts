import { RemixDevTools } from "./RemixDevTools/RemixDevTools";
import { type Tab } from "./RemixDevTools/tabs/index";
// Names exports
export { useRemixForgeSocket } from "./RemixDevTools/hooks/useRemixForgeSocket";
export { initClient, initServer } from "./RemixDevTools/init/project";
export { EmbeddedDevTools } from "./RemixDevTools/EmbeddedDevTools";
// Type exports
export type { EmbeddedDevToolsProps } from "./RemixDevTools/EmbeddedDevTools";
export type { RemixDevToolsProps } from "./RemixDevTools/RemixDevTools";
export type Plugin = (...args: any) => Tab;

// Default export
export default RemixDevTools;
