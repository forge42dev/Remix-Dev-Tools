import { GitMerge, Terminal, Layers /* Settings */ } from "lucide-react";
import { PageTab } from "./PageTab";
import { RoutesTab } from "./RoutesTab";
import { TerminalTab } from "./TerminalTab";
/* import { SettingsTab } from "./SettingsTab"; */

export type Tabs = (typeof tabs)[number]["id"];

export interface Tab {
  name: string;
  icon: JSX.Element;
  id: string;
  component: JSX.Element;
  requiresForge: boolean;
  hideTimeline: boolean;
}

const TAB_SIZE = 16;

export const tabs = [
  {
    name: "Active page",
    icon: <Layers size={TAB_SIZE} />,
    id: "page",
    component: <PageTab />,
    requiresForge: false,
    hideTimeline: false,
  },
  {
    name: "Routes",
    icon: <GitMerge size={TAB_SIZE} />,
    id: "routes",
    component: <RoutesTab />,
    requiresForge: false,
    hideTimeline: false,
  },
  {
    name: "Terminal",
    icon: <Terminal size={TAB_SIZE} />,
    id: "terminal",
    component: <TerminalTab />,
    requiresForge: true,
    hideTimeline: false,
  },
  /* {
    name: "Settings",
    icon: <Settings size={TAB_SIZE} />,
    id: "settings",
    component: <SettingsTab />,
    requiresForge: false,
    hideTimeline: false,
  }, */
] as const;
