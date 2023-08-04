import { useEffect, useMemo } from "react";
import { RemixDevToolsProps } from "../RemixDevTools";
import { useSettingsContext } from "../context/useRDTContext";
import { tabs } from "../tabs";

export const useTabs = (
  isConnected: boolean,
  isConnecting: boolean,
  plugins?: RemixDevToolsProps["plugins"]
) => {
  const { settings, setSettings } = useSettingsContext();
  const { activeTab } = settings;
  const allTabs = useMemo(
    () => [...tabs, ...(plugins ? plugins : [])],
    [plugins]
  );
  const { Component, hideTimeline } = useMemo(() => {
    const tab = allTabs.find((tab) => tab.id === activeTab);
    return { Component: tab?.component, hideTimeline: tab?.hideTimeline };
  }, [activeTab, allTabs]);
  const visibleTabs = useMemo(
    () => allTabs.filter((tab) => !(!isConnected && tab.requiresForge)),
    [isConnected, allTabs]
  );

  // Changes tab if on invalid one
  useEffect(() => {
    const shouldCheck = !isConnected && !isConnecting;
    if (!shouldCheck) return;
    const isOnForgeTab = tabs.some(
      (tab) => tab.requiresForge && tab.id === activeTab
    );
    const isOnAdditionalForgeTab = Boolean(
      plugins?.some((tab) => tab.requiresForge && tab.id === activeTab)
    );
    if (isOnForgeTab || isOnAdditionalForgeTab) {
      setSettings({
        activeTab: "page",
      });
    }
  }, [isConnected, isConnecting, activeTab, setSettings, plugins]);

  return { visibleTabs, Component, allTabs, hideTimeline };
};
