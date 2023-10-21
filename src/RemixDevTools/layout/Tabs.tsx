import clsx from "clsx";

import {
  useDetachedWindowControls,
  useHtmlErrors,
  usePersistOpen,
  useSettingsContext,
} from "../context/useRDTContext.js";
import { useRemixForgeSocket } from "../hooks/useRemixForgeSocket.js";
import { useTabs } from "../hooks/useTabs.js";
import { Tab, Tabs as TabType } from "../tabs/index.js";
import { useHorizontalScroll } from "../hooks/useHorizontalScroll.js";
import { twMerge } from "tailwind-merge";
import {
  REMIX_DEV_TOOLS_DETACHED_OWNER,
  REMIX_DEV_TOOLS_IS_DETACHED,
  setSessionItem,
  setStorageItem,
} from "../utils/storage.js";
import { Icon } from "../components/icon/Icon.js";

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
        "rdt-relative rdt-flex rdt-shrink-0 rdt-cursor-pointer rdt-items-center rdt-gap-2 rdt-border-0 rdt-border-b rdt-border-r-2 rdt-border-solid rdt-border-b-[#212121] rdt-border-r-[#212121] rdt-px-4 rdt-font-sans rdt-transition-all",
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
  const { htmlErrors } = useHtmlErrors();
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
          <Tab
            key={tab.id}
            tab={
              tab.id === "errors"
                ? {
                    ...tab,
                    name: (
                      <div className="rdt-inline-flex rdt-items-center rdt-gap-1">
                        {tab.name}
                        {htmlErrors.length > 0 && (
                          <span className="rdt-animate-pulse rdt-font-bold rdt-text-red-600">
                            ({htmlErrors.length})
                          </span>
                        )}
                      </div>
                    ),
                  }
                : tab
            }
            activeTab={activeTab}
            className="rdt-cursor-pointer rdt-duration-300"
          />
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
                icon: <Icon name="Radio" className="rdt-h-4 rdt-w-4" />,
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
                <Icon
                  name="CopySlash"
                  onClick={handleDetachment}
                  className="rdt-cursor-pointer rdt-transition-all hover:rdt-text-green-600"
                />
              )}
              <Icon
                name="X"
                onClick={() => {
                  setPersistOpen(false);
                  setIsOpen(false);
                }}
                className="rdt-h-6 rdt-w-6   rdt-cursor-pointer rdt-transition-all hover:rdt-text-red-600"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { Tabs };
