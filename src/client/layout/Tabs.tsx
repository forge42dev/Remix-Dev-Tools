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
        "group relative flex shrink-0 cursor-pointer items-center justify-center border-0 border-b border-solid border-b-[#212121] border-r-[#212121] p-2 font-sans transition-all",
        activeTab !== tab.id && "hover:bg-[#212121]",
        activeTab === tab.id && "bg-[#212121]",
        "hover:bg-[#212121]/50"
      )}
    >
      <div className={clsx(className, "group-hover:opacity-80 transition-all")}>{tab.icon}</div>
      <div
        className={clsx(
          "duration-400 invisible text-white opacity-0 transition after:absolute after:-left-2 after:top-1/2 after:h-0 after:w-0 after:-translate-y-1/2 after:-rotate-90 after:border-x-4 after:border-b-[6px] after:border-x-transparent after:border-b-gray-700 group-hover:visible",
          "absolute left-full z-50 ml-2 whitespace-nowrap rounded border border-gray-700 bg-gray-800 px-2 group-hover:opacity-100"
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

  const getErrorCount = () => {
    return htmlErrors.length + (window.HYDRATION_OVERLAY.ERROR ? 1 : 0);
  }

  const hasErrors = getErrorCount() > 0;
  return (
    <div className="relative flex h-full bg-gray-800">
      <div ref={scrollRef} className="remix-dev-tools-tab  flex h-full w-full flex-col">
        {visibleTabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={{
              ...tab,
              name: tab.id === "errors" && hasErrors ? `Errors (${getErrorCount()})` : tab.name,
            }}
            activeTab={activeTab}
            className={clsx(
              "cursor-pointer",
              tab.id === "errors" &&
                activeTab !== "errors" &&
                hasErrors &&
                "animate-pulse font-bold text-red-600 duration-1000"
            )}
          />
        ))}
        <div className={clsx("mt-auto flex w-full flex-col items-center")}>
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
                  isConnecting && "pointer-events-none animate-pulse cursor-default",
                  "mt-auto w-full ",
                  detachedWindow ? "mr-0" : ""
                )
              )}
              onClick={() => setSettings({ shouldConnectWithForge: true })}
            />
          )}
          {!detachedWindow && setIsOpen && (
            <>
              {!detachedWindowOwner && (
                <Tab
                  className="transition-all hover:text-green-600"
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
                className="hover:text-red-600"
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
