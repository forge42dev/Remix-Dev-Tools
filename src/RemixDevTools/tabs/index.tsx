import {
  GitMerge,
  Terminal,
  /* Server, */ History,
  Layers,
} from "lucide-react";
import { PageTab } from "./PageTab";
import { RoutesTab } from "./RoutesTab"; /* 
import { ServerTab } from "./ServerTab";*/
import { TerminalTab } from "./TerminalTab";
import { TimelineTab } from "./TimelineTab";

export type Tabs = (typeof tabs)[number]["id"];

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
    name: "Timeline",
    icon: <History size={TAB_SIZE} />,
    id: "timeline",
    component: <TimelineTab />,
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
  } /*
  {
    name: "Server",
    icon: <Server size={TAB_SIZE} />,
    id: "server",
    component: <ServerTab />,
    requiresForge: true,
  }, */,
] as const;
