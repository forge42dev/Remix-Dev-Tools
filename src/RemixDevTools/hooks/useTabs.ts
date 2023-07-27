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
    () => [...tabs.filter(tab => tab.id !== "settings"), ...(additionalTabs ? additionalTabs : [])],
    [additionalTabs]
  );
  const Component = useMemo(
    () => allTabs.find((t) => t.id === activeTab)?.component,
    [activeTab, allTabs]
  );
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

  return { visibleTabs, Component, allTabs };
};
