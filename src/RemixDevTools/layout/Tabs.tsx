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
        "rdt-group rdt-relative rdt-flex rdt-shrink-0 rdt-cursor-pointer rdt-items-center rdt-justify-center rdt-border-0 rdt-border-b rdt-border-solid rdt-border-b-[#212121] rdt-border-r-[#212121] rdt-p-2 rdt-font-sans rdt-transition-all",
        activeTab !== tab.id && "rdt-hover:opacity-50",
        activeTab === tab.id && "rdt-bg-[#212121]",
        "hover:rdt-bg-[#212121]/50",
        className
      )}
    >
      {tab.icon}
      <div
        className={clsx(
          "rdt-duration-400 rdt-invisible rdt-text-white rdt-opacity-0 rdt-transition-all after:rdt-absolute after:-rdt-left-2 after:rdt-top-1/2 after:rdt-h-0 after:rdt-w-0 after:-rdt-translate-y-1/2 after:-rdt-rotate-90 after:rdt-border-x-4 after:rdt-border-b-[6px] after:rdt-border-x-transparent after:rdt-border-b-gray-700 group-hover:rdt-visible",
          "rdt-absolute rdt-left-full rdt-z-50 rdt-ml-2 rdt-whitespace-nowrap rdt-rounded rdt-border rdt-border-gray-700 rdt-bg-gray-800 rdt-px-2 group-hover:rdt-opacity-100"
        )}
      >
        {tab.name}
      </div>
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
    <div className="rdt-relative rdt-flex rdt-h-full rdt-bg-gray-800">
      <div ref={scrollRef} className="remix-dev-tools-tab rdt-flex rdt-h-full rdt-w-full rdt-flex-col  ">
        {visibleTabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={{
              ...tab,
              name: tab.id === "errors" && htmlErrors.length ? `Errors (${htmlErrors.length})` : tab.name,
            }}
            activeTab={activeTab}
            className={clsx(
              "rdt-cursor-pointer rdt-duration-300",
              tab.id === "errors" &&
                activeTab !== "errors" &&
                htmlErrors.length &&
                "rdt-animate-pulse rdt-font-bold rdt-text-red-600 rdt-duration-1000"
            )}
          />
        ))}
        <div className={clsx("rdt-mt-auto rdt-flex rdt-w-full rdt-flex-col rdt-items-center")}>
          {shouldShowConnectToForge && (
            <Tab
              tab={{
                id: "connect",
                name: isConnecting ? "Connecting to Forge..." : "Connect to Remix Forge",
                requiresForge: false,
                hideTimeline: false,
                component: <></>,
                icon: <Icon name="Radio" size="md" />,
              }}
              className={twMerge(
                clsx(
                  isConnecting && "rdt-pointer-events-none rdt-animate-pulse rdt-cursor-default",
                  "rdt-mt-auto rdt-w-full rdt-pb-2",
                  detachedWindow ? "rdt-mr-0" : "rdt-border-b"
                )
              )}
              onClick={() => setSettings({ shouldConnectWithForge: true })}
            />
          )}
          {!detachedWindow && setIsOpen && (
            <>
              {!detachedWindowOwner && (
                <Tab
                  className="rdt-transition-all hover:rdt-text-green-600"
                  tab={{
                    icon: <Icon name="CopySlash" size="md" onClick={handleDetachment} />,
                    id: "detach",
                    name: "Detach",
                    requiresForge: false,
                    hideTimeline: false,
                    component: <></>,
                  }}
                />
              )}
              <Tab
                className="hover:rdt-text-red-600"
                tab={{
                  icon: <Icon name="X" size="md" />,
                  id: "close",
                  name: "Close",
                  requiresForge: false,
                  hideTimeline: false,
                  component: <></>,
                }}
                onClick={() => {
                  setPersistOpen(false);
                  setIsOpen(false);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { Tabs };
