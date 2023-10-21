import clsx from "clsx";
import copySlashURL from "../icons/copy-slash.svg";
import xURL from "../icons/x.svg";
import radioURL from "../icons/radio.svg";

import { useDetachedWindowControls, usePersistOpen, useSettingsContext } from '../context/useRDTContext.js';
import { useRemixForgeSocket } from '../hooks/useRemixForgeSocket.js';
import { useTabs } from '../hooks/useTabs.js';
import { Tab, Tabs as TabType } from '../tabs/index.js';
import { useHorizontalScroll } from '../hooks/useHorizontalScroll.js';
import { twMerge } from "tailwind-merge";
import {
  REMIX_DEV_TOOLS_DETACHED_OWNER,
  REMIX_DEV_TOOLS_IS_DETACHED,
  setSessionItem,
  setStorageItem,
} from '../utils/storage.js';

declare global {
  interface Window {
    RDT_MOUNTED: boolean;
  }
}

interface TabsProps {
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  plugins?: Tab[];
}

const Tab = ({
  tab,
  activeTab,
  className,
  onClick,
}: {
  tab: Tab;
  activeTab?: string;
  className?: string;
  onClick?: () => void;
}) => {
  const { setSettings } = useSettingsContext();
  return (
    <div
      onClick={() => (onClick ? onClick() : setSettings({ activeTab: tab.id as TabType }))}
      className={clsx(
        "rdt-flex rdt-shrink-0 rdt-cursor-pointer rdt-items-center rdt-gap-2 rdt-border-0 rdt-border-b rdt-border-r-2 rdt-border-solid rdt-border-b-[#212121] rdt-border-r-[#212121] rdt-px-4 rdt-font-sans rdt-transition-all",
        activeTab !== tab.id && "rdt-hover:opacity-50",
        activeTab === tab.id && "rdt-bg-[#212121]",
        className
      )}
    >
      {tab.icon} {tab.name}
    </div>
  );
};

const Tabs = ({ plugins, setIsOpen }: TabsProps) => {
  const { settings, setSettings } = useSettingsContext();
  const { setPersistOpen } = usePersistOpen();
  const { activeTab } = settings;
  const { isConnected, isConnecting } = useRemixForgeSocket();
  const { visibleTabs } = useTabs(isConnected, isConnecting, plugins);
  const shouldShowConnectToForge = !isConnected || isConnecting;
  const scrollRef = useHorizontalScroll();
  const { setDetachedWindowOwner, detachedWindowOwner, detachedWindow } = useDetachedWindowControls();
  const handleDetachment = () => {
    const rdtWindow = window.open(
      window.location.href,
      "",
      `popup,width=${window.innerWidth},height=${settings.height},top=${window.screen.height},left=${window.screenLeft}}`
    );

    if (rdtWindow) {
      setDetachedWindowOwner(true);
      setStorageItem(REMIX_DEV_TOOLS_IS_DETACHED, "true");
      setSessionItem(REMIX_DEV_TOOLS_DETACHED_OWNER, "true");
      rdtWindow.RDT_MOUNTED = true;
    }
  };
  return (
    <div className="rdt-relative rdt-flex rdt-h-8 rdt-w-full rdt-bg-gray-800">
      <div
        ref={scrollRef}
        className="remix-dev-tools-tab rdt-flex rdt-h-full rdt-w-full rdt-overflow-x-auto rdt-overflow-y-hidden"
      >
        {visibleTabs.map((tab) => (
          <Tab key={tab.id} tab={tab} activeTab={activeTab} className="rdt-duration-300" />
        ))}
        <div className={clsx("rdt-ml-auto rdt-flex rdt-items-center rdt-gap-2", detachedWindow ? "" : "rdt-pr-4")}>
          {shouldShowConnectToForge && (
            <Tab
              tab={{
                id: "connect",
                name: isConnecting ? "Connecting to Forge..." : "Connect to Remix Forge",
                requiresForge: false,
                hideTimeline: false,
                component: <></>,
                icon: <svg className="rdt-w-4 rdt-h-4"><use href={radioURL + "#icon"} /></svg>,
              }}
              className={twMerge(
                clsx(
                  isConnecting && "rdt-pointer-events-none rdt-animate-pulse rdt-cursor-default",
                  "rdt-ml-auto rdt-h-full",
                  detachedWindow ? "rdt-mr-0" : "rdt-mr-2 rdt-border-r-2"
                )
              )}
              onClick={() => setSettings({ shouldConnectWithForge: true })}
            />
          )}
          {!detachedWindow && setIsOpen && (
            <>
              {!detachedWindowOwner && (
                <svg
                  onClick={handleDetachment}
                  className="rdt-cursor-pointer rdt-transition-all hover:rdt-text-green-600"
                >
                  <use href={copySlashURL + "#icon"} />
                </svg>
              )}
              <svg
                onClick={() => {
                  setPersistOpen(false);
                  setIsOpen(false);
                }}
                className="rdt-h-6 rdt-w-6   rdt-cursor-pointer rdt-transition-all hover:rdt-text-red-600"
              >
                <use href={xURL + "#icon"} />
              </svg>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { Tabs };
