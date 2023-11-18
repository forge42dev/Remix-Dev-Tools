import { defineClientConfig } from "./RemixDevTools/init/root.js";
import { type Tab } from "./RemixDevTools/tabs/index.js";
// Named exports
export { useRemixForgeSocket } from "./RemixDevTools/hooks/useRemixForgeSocket.js";
export { EmbeddedDevTools } from "./RemixDevTools/EmbeddedDevTools.js";
export { withDevTools } from "./RemixDevTools/init/root.js";
export { withViteDevTools } from "./RemixDevTools/init/root.js";
export { defineClientConfig };
// Type exports
export type { EmbeddedDevToolsProps } from "./RemixDevTools/EmbeddedDevTools.js";
export type { RemixDevToolsProps } from "./RemixDevTools/RemixDevTools.js";
export type RdtPlugin = (...args: any) => Tab;
