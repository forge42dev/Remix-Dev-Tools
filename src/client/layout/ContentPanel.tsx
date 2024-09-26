import clsx from "clsx";
import { TimelineTab } from "../tabs/TimelineTab.js";
import { Tab } from "../tabs/index.js";
import { useRemixForgeSocket } from "../hooks/useRemixForgeSocket.js";
import { useTabs } from "../hooks/useTabs.js";
import { Fragment } from "react";

interface ContentPanelProps {
  leftSideOriented: boolean;
  plugins?: Tab[];
}

const ContentPanel = ({ plugins }: ContentPanelProps) => {
  const { isConnected, isConnecting } = useRemixForgeSocket();
  const { Component, hideTimeline, isPluginTab, activeTab } = useTabs(isConnected, isConnecting, plugins);

  return (
    <div className="flex h-full w-full overflow-y-hidden">
      <div
        className={clsx(
          "z-20 h-full w-full overflow-y-auto bg-main p-2",
          "pl-2",
          isPluginTab && "unset",
          activeTab === "page" && "pt-0"
        )}
      >
        {Component}
      </div>

      {!hideTimeline && (
        <Fragment>
          <div className="w-1 bg-gray-500/20"></div>
          <div className={clsx("z-10 h-full w-1/3 p-2")}>
            <TimelineTab />
          </div>
        </Fragment>
      )}
    </div>
  );
};

export { ContentPanel };
