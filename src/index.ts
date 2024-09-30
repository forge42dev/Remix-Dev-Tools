import type { Tab } from "./client/tabs/index.js"

export { remixDevTools, defineRdtConfig } from "./vite/plugin.js"
// Type exports
export type { EmbeddedDevToolsProps } from "./client/EmbeddedDevTools.js"
export type { RemixDevToolsProps } from "./client/RemixDevTools.js"
export type RdtPlugin = (...args: any) => Tab
