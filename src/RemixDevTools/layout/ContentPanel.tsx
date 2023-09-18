import clsx from "clsx";
import { TimelineTab } from '../tabs/TimelineTab.js';
import { Tab } from '../tabs/index.js';
import { useRemixForgeSocket } from '../hooks/useRemixForgeSocket.js';
import { useTabs } from '../hooks/useTabs.js';
import { Fragment } from "react";

interface ContentPanelProps {
  leftSideOriented: boolean;
  plugins?: Tab[];
}

const ContentPanel = ({ leftSideOriented, plugins }: ContentPanelProps) => {
  const { isConnected, isConnecting } = useRemixForgeSocket();
  const { Component, hideTimeline, isPluginTab } = useTabs(isConnected, isConnecting, plugins);

  return (
    <div className="rdt-flex rdt-h-full rdt-w-full rdt-overflow-y-hidden">
      <div
        className={clsx(
          "rdt-z-20 rdt-h-full rdt-w-full rdt-overflow-y-auto rdt-bg-[#212121] rdt-p-2",
          leftSideOriented ? "rdt-pl-6" : "rdt-pl-6",
          isPluginTab && "rdt-unset"
        )}
      >
        {Component}
      </div>

      {!hideTimeline && (
        <Fragment>
          <div className="rdt-w-1 rdt-bg-gray-500/20"></div>
          <div
            className={clsx(
              "rdt-z-10 rdt-h-full rdt-w-1/3 rdt-p-2",
              leftSideOriented ? "rdt-pl-2" : "rdt-pr-2" // leftSideOriented ? "rdt-pl-16" : "rdt-pr-16" Spacing is too much
            )}
          >
            <TimelineTab />
          </div>
        </Fragment>
      )}
    </div>
  );
};

export { ContentPanel };
