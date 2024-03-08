import { PageTab } from "./PageTab.js";
import { RoutesTab } from "./RoutesTab.js";
import { TerminalTab } from "./TerminalTab.js";
import { SettingsTab } from "./SettingsTab.js";
import { Icon } from "../components/icon/Icon.js";
import { ErrorsTab } from "./ErrorsTab.js";

export type Tabs = (typeof tabs)[number]["id"];

export interface Tab {
  name: string | JSX.Element;
  icon: JSX.Element;
  id: string;
  component: JSX.Element;
  requiresForge: boolean;
  hideTimeline: boolean;
}

export const tabs = [
  {
    name: "Active page",
    icon: <Icon size="md" name="Layers" />,
    id: "page",
    component: <PageTab />,
    requiresForge: false,
    hideTimeline: false,
  },
  {
    name: "Routes",
    icon: <Icon size="md" name="GitMerge" />,
    id: "routes",
    component: <RoutesTab />,
    requiresForge: false,
    hideTimeline: false,
  },
  {
    name: "Terminal",
    icon: <Icon size="md" name="Terminal" />,
    id: "terminal",
    component: <TerminalTab />,
    requiresForge: true,
    hideTimeline: false,
  },
  {
    name: "Errors",
    icon: <Icon size="md" name="Shield" />,
    id: "errors",
    component: <ErrorsTab />,

    requiresForge: false,
    hideTimeline: false,
  },
  {
    name: "Settings",
    icon: <Icon size="md" name="Settings" />,
    id: "settings",
    component: <SettingsTab />,
    requiresForge: false,
    hideTimeline: false,
  },
] as const;
