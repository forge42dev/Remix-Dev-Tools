import { GitMerge, Terminal, Layers } from "lucide-react";
import { PageTab } from "./PageTab";
import { RoutesTab } from "./RoutesTab";
import { TerminalTab } from "./TerminalTab";

export type Tabs = (typeof tabs)[number]["id"];

export interface Tab {
  name: string;
  icon: JSX.Element;
  id: string;
  component: JSX.Element;
  requiresForge: boolean;
}

const TAB_SIZE = 16;

export const tabs = [
  {
    name: "Active page",
    icon: <Layers size={TAB_SIZE} />,
    id: "page",
    component: <PageTab />,
    requiresForge: false,
  },

  {
    name: "Routes",
    icon: <GitMerge size={TAB_SIZE} />,
    id: "routes",
    component: <RoutesTab />,
    requiresForge: false,
  },
  {
    name: "Terminal",
    icon: <Terminal size={TAB_SIZE} />,
    id: "terminal",
    component: <TerminalTab />,
    requiresForge: true,
  },
] as const;
