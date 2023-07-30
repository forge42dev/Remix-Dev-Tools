import { useEffect, useMemo } from "react";
import { RemixDevToolsProps } from "../RemixDevTools";
import { useRDTContext } from "../context/useRDTContext";
import { tabs } from "../tabs";

export const useTabs = (
  isConnected: boolean,
  isConnecting: boolean,
  additionalTabs?: RemixDevToolsProps["additionalTabs"]
) => {
  const { activeTab, setActiveTab } = useRDTContext();

  const allTabs = useMemo(
    () => [...tabs, ...(additionalTabs ? additionalTabs : [])],
    [additionalTabs]
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
      additionalTabs?.some((tab) => tab.requiresForge && tab.id === activeTab)
    );
    if (isOnForgeTab || isOnAdditionalForgeTab) {
      setActiveTab("page");
    }
  }, [isConnected, isConnecting, activeTab, setActiveTab, additionalTabs]);

  return { visibleTabs, Component, allTabs, hideTimeline };
};
