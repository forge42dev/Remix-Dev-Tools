import clsx from "clsx";
import { useEffect, useState, Suspense } from "react";
import { RDTContextProvider } from "./context/RDTContext";
import { Tab, Tabs } from "./tabs";
import { useTimelineHandler } from "./hooks/useTimelineHandler";
import { useRDTContext } from "./context/useRDTContext";
import { isDev } from "./utils/isDev";
import { useGetSocket } from "./hooks/useGetSocket";
import { Radio } from "lucide-react";
import { useResize } from "./hooks/useResize";
import { useLocation } from "@remix-run/react";
import { useOutletAugment } from "./hooks/useOutletAugment";
import { Trigger } from "./components/Trigger";
import { TimelineTab } from "./tabs/TimelineTab";
import { useTabs } from "./hooks/useTabs";

interface Props extends RemixDevToolsProps {
  defaultOpen: boolean;
  position: Exclude<RemixDevToolsProps["position"], undefined>;
  hideUntilHover: boolean;
}

const RemixDevTools = ({
  defaultOpen,
  position,
  additionalTabs,
  hideUntilHover,
}: Props) => {
  const {
    activeTab,
    setActiveTab,
    setShouldConnectWithForge,
    height,
    persistOpen,
  } = useRDTContext();
  const { enableResize, disableResize, isResizing } = useResize();
  useTimelineHandler();
  const { isConnected, isConnecting } = useGetSocket();
  const { Component, visibleTabs } = useTabs(
    isConnected,
    isConnecting,
    additionalTabs
  );
  const leftSideOriented = position.includes("left");

  const [isOpen, setIsOpen] = useState(defaultOpen || persistOpen);

  const shouldShowConnectToForge = !isConnected || isConnecting;

  return (
    <div className="remix-dev-tools">
      <Trigger
        isOpen={isOpen}
        position={position}
        hideUntilHover={hideUntilHover}
        setIsOpen={setIsOpen}
      />
      <div
        style={{ zIndex: 9998, height }}
        className={clsx(
          "rdt-duration-600 rdt-fixed rdt-bottom-0 rdt-left-0 rdt-box-border rdt-flex rdt-w-screen rdt-resize-y rdt-flex-col rdt-overflow-auto rdt-bg-[#212121] rdt-text-white rdt-opacity-0 rdt-transition-all",
          isOpen ? "rdt-opacity-100 rdt-drop-shadow-2xl" : "rdt-h-0",
          isResizing ? "rdt-pointer-events-none" : "",
          isResizing && "rdt-cursor-grabbing "
        )}
      >
        <div
          onMouseDown={enableResize}
          onMouseUp={disableResize}
          className={clsx(
            "rdt-absolute rdt-h-1 rdt-w-full rdt-cursor-n-resize",
            isResizing && "rdt-cursor-grabbing "
          )}
        />
        <div className="rdt-flex rdt-h-8 rdt-w-full rdt-bg-gray-800">
          {visibleTabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tabs)}
              className={clsx(
                "rdt-flex rdt-cursor-pointer rdt-items-center rdt-gap-2 rdt-border-0 rdt-border-b rdt-border-r-2 rdt-border-solid rdt-border-b-[#212121] rdt-border-r-[#212121] rdt-px-4 rdt-font-sans rdt-transition-all rdt-duration-300",
                activeTab !== tab.id && "rdt-hover:opacity-50",
                activeTab === tab.id && "rdt-bg-[#212121]"
              )}
            >
              {tab.icon} {tab.name}
            </div>
          ))}
          {shouldShowConnectToForge && (
            <div
              onClick={() => setShouldConnectWithForge(true)}
              className={clsx(
                isConnecting &&
                  "rdt-pointer-events-none rdt-animate-pulse rdt-cursor-default",
                "rdt-flex rdt-cursor-pointer rdt-items-center rdt-gap-2 rdt-border-0 rdt-border-b rdt-border-r-2 rdt-border-solid rdt-border-b-[#212121] rdt-border-r-[#212121] rdt-px-4 rdt-font-sans rdt-transition-all"
              )}
            >
              <Radio size={16} />
              {isConnecting
                ? "Connecting to Forge..."
                : "Connect to Remix Forge"}
            </div>
          )}
        </div>
        <div className="rdt-flex rdt-h-full rdt-w-full rdt-overflow-y-hidden">
          <div
            className={clsx(
              "rdt-z-20 rdt-h-full rdt-w-full rdt-bg-[#212121] rdt-p-2",
              leftSideOriented ? "rdt-pl-16" : "rdt-pl-8"
            )}
          >
            {Component}
          </div>
          <div className="rdt-w-1 rdt-bg-gray-500/20"></div>
          <div
            className={clsx(
              "rdt-z-10 rdt-h-full rdt-w-2/3 rdt-p-2",
              leftSideOriented ? "rdt-pl-16" : "rdt-pr-16"
            )}
          >
            <TimelineTab />
          </div>
        </div>
      </div>
    </div>
  );
};

let hydrating = true;

function useHydrated() {
  const [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}

export interface RemixDevToolsProps {
  // A port to connect to the Remix Forge in your vscode extension
  port?: number;
  // Whether the dev tools should be open by default
  defaultOpen?: boolean;
  // Whether the dev tools require a url flag to be shown
  requireUrlFlag?: boolean;
  // Set the position of the trigger button
  position?:
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left"
    | "middle-right"
    | "middle-left";
  // Show route boundaries when you hover over a route in active page tab
  showRouteBoundaries?: boolean;
  // Additional tabs to add to the dev tools
  additionalTabs?: Tab[];
  // Whether the dev tools trigger should hide until hovered
  hideUntilHover?: boolean;
}

const RDTWithContext = ({
  port = 3003,
  defaultOpen = false,
  requireUrlFlag,
  showRouteBoundaries = false,
  position = "bottom-right",
  hideUntilHover = false,
  additionalTabs,
}: RemixDevToolsProps) => {
  const hydrated = useHydrated();
  const isDevelopment = isDev();
  const url = useLocation().search;
  useOutletAugment(showRouteBoundaries);

  if (!hydrated || !isDevelopment) return null;
  if (requireUrlFlag && !url.includes("rdt=true")) return null;
  return (
    <RDTContextProvider showRouteBoundaries={showRouteBoundaries} port={port}>
      <Suspense
        fallback={
          <Trigger
            isOpen
            setIsOpen={() => void 0}
            position={position}
            hideUntilHover={hideUntilHover}
          />
        }
      >
        <RemixDevTools
          defaultOpen={defaultOpen}
          position={position}
          additionalTabs={additionalTabs}
          hideUntilHover={hideUntilHover}
        />
      </Suspense>
    </RDTContextProvider>
  );
};

export { RDTWithContext as RemixDevTools };
