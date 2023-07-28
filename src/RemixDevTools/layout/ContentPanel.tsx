import clsx from "clsx";
import { TimelineTab } from "../tabs/TimelineTab";
import { Tab } from "../tabs";
import { useRemixForgeSocket } from "../hooks/useRemixForgeSocket";
import { useTabs } from "../hooks/useTabs";
import { Fragment } from 'react';
import { useRDTContext } from "../context/useRDTContext";

interface ContentPanelProps {
  leftSideOriented: boolean;
  additionalTabs?: Tab[];
}

const ContentPanel = ({
  leftSideOriented,
  additionalTabs,
}: ContentPanelProps) => {
  const { isConnected, isConnecting } = useRemixForgeSocket();
  const { Component } = useTabs(isConnected, isConnecting, additionalTabs);
  const { activeTab } = useRDTContext();

  return (
    <div className="rdt-flex rdt-h-full rdt-w-full rdt-overflow-y-hidden">
      <div
        className={clsx(
          "rdt-z-20 rdt-h-full rdt-w-full rdt-bg-[#212121] rdt-p-2",
          leftSideOriented ? "rdt-pl-6" : "rdt-pl-6" // leftSideOriented ? "rdt-pl-16" : "rdt-pl-8" Spacing is too much
        )}
      >
        {Component}
      </div>
      {/** Future note: Since there are chances I want to create a tab without
           timeline involved, add the ability to disable timeline when creating a new tab */}
      {activeTab !== "settings" &&
        <Fragment>
          <div className="rdt-w-1 rdt-bg-gray-500/20"></div>
          <div
            className={clsx(
              "rdt-z-10 rdt-h-full rdt-w-2/3 rdt-p-2",
              leftSideOriented ? "rdt-pl-2" : "rdt-pr-2" // leftSideOriented ? "rdt-pl-16" : "rdt-pr-16" Spacing is too much
            )}
          >
            <TimelineTab />
          </div>
        </Fragment>
      }
    </div>
  );
};

export { ContentPanel };
