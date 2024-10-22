import type { Tab } from "./client/tabs/index.js"

export { reactRouterDevTools, defineRdtConfig } from "./vite/plugin.js"
// Type exports
export type { EmbeddedDevToolsProps } from "./client/EmbeddedDevTools.js"
export type { ReactRouterToolsProps } from "./client/react-router-dev-tools.js"
export type RdtPlugin = (...args: any) => Tab
