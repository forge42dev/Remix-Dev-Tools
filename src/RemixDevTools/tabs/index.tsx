import gitMergeURL from "../icons/git-merge.svg";
import terminalURL from "../icons/terminal.svg";
import layersURL from "../icons/layers.svg";
import settingsURL from "../icons/settings.svg";

import { PageTab } from './PageTab.js';
import { RoutesTab } from './RoutesTab.js';
import { TerminalTab } from './TerminalTab.js';
import { SettingsTab } from './SettingsTab.js';

export type Tabs = (typeof tabs)[number]["id"];

export interface Tab {
  name: string;
  icon: JSX.Element;
  id: string;
  component: JSX.Element;
  requiresForge: boolean;
  hideTimeline: boolean;
}

export const tabs = [
  {
    name: "Active page",
    icon: <svg className="rdt-w-4 rdt-h-4"><use href={layersURL + "#icon"} /></svg>,
    id: "page",
    component: <PageTab />,
    requiresForge: false,
    hideTimeline: false,
  },
  {
    name: "Routes",
    icon: <svg className="rdt-w-4 rdt-h-4"><use href={gitMergeURL + "#icon"} /></svg>,
    id: "routes",
    component: <RoutesTab />,
    requiresForge: false,
    hideTimeline: false,
  },
  {
    name: "Terminal",
    icon: <svg className="rdt-w-4 rdt-h-4"><use href={terminalURL + "#icon"} /></svg>,
    id: "terminal",
    component: <TerminalTab />,
    requiresForge: true,
    hideTimeline: false,
  },
  {
    name: "Settings",
    icon: <svg className="rdt-w-4 rdt-h-4"><use href={settingsURL + "#icon"} /></svg>,
    id: "settings",
    component: <SettingsTab />,
    requiresForge: false,
    hideTimeline: false,
  },
] as const;
