import clsx from "clsx";
import { Logo } from "./components/Logo";
import { useEffect, useState } from "react";
import { RDTContextProvider } from "./context/RDTContext";
import { tabs } from "./tabs";
import { useTimelineHandler } from "./hooks/useTimelineHandler";
import { useRDTContext } from "./context/useRDTContext";
import { isDev } from "./utils/isDev";
import { useGetSocket } from "./hooks/useGetSocket";
import { Radio } from "lucide-react";
import { useResize } from "./hooks/useResize";
import { useLocation } from "@remix-run/react";
import { useOutletAugment } from "./hooks/useOutletAugment";

interface Props extends RemixDevToolsProps {
  defaultOpen: boolean;
  position: Exclude<RemixDevToolsProps["position"], undefined>;
}

const RemixDevTools = ({ defaultOpen, position }: Props) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const { activeTab, setActiveTab, setShouldConnectWithForge, height } =
    useRDTContext();

  const { enableResize, disableResize, isResizing } = useResize();

  useTimelineHandler();

  const { isConnected, isConnecting } = useGetSocket();
  const Component = tabs.find((tab) => tab.id === activeTab)?.component;
  const leftSideOriented =
    position === "top-left" ||
    position === "bottom-left" ||
    position === "middle-left";

  return (
    <div className="remix-dev-tools">
      <div
        style={{ zIndex: 9999 }}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "rdt-fixed rdt-m-1.5 rdt-h-14 rdt-w-14 rdt-cursor-pointer rdt-rounded-full ",
          position === "bottom-right" && "rdt-bottom-0 rdt-right-0",
          position === "bottom-left" && "rdt-bottom-0 rdt-left-0",
          position === "top-right" && "rdt-right-0 rdt-top-0",
          position === "top-left" && "rdt-left-0 rdt-top-0",
          position === "middle-right" &&
          "rdt-right-0 rdt-top-1/2 -rdt-translate-y-1/2",
          position === "middle-left" &&
          "rdt-left-0 rdt-top-1/2 -rdt-translate-y-1/2",
          isOpen && "rdt-hidden" // Hide the button when the dev tools is open
        )}
      >
        <Logo
          className={clsx(
            "rdt-h-14 rdt-w-14 rdt-rounded-full rdt-transition-all rdt-duration-200",
            "rdt-hover:cursor-pointer rdt-hover:ring-2 rdt-ring-slate-600",
          )}
        />
      </div>
      <div
        style={{ zIndex: 9998, height }}
        className={clsx(
          "remix-dev-tools-window rdt-duration-600 rdt-fixed rdt-bottom-0 rdt-left-0 rdt-box-border rdt-flex rdt-w-screen rdt-resize-y rdt-flex-col rdt-overflow-auto rdt-bg-[#212121] rdt-text-white rdt-opacity-0 rdt-transition-all",
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
        <div className="rdt-h-8 rdt-w-full rdt-relative rdt-bg-gray-800 rdt-select-none">
          <div className="rdt-overflow-y-auto rdt-w-full rdt-flex rdt-h-full rdt-pr-12">
            {tabs
              .filter(
                (tab) =>
                  !(!isConnected && tab.requiresForge) && tab.id !== "timeline"
              )
              .map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "rdt-flex rdt-cursor-pointer rdt-items-center rdt-gap-2 rdt-border-0 rdt-border-b rdt-border-r-2 rdt-border-solid rdt-border-b-[#212121] rdt-border-r-[#212121] rdt-px-4 rdt-font-sans rdt-transition-all rdt-duration-300",
                    activeTab !== tab.id && "rdt-hover:opacity-50",
                    activeTab === tab.id && "rdt-bg-[#212121]"
                  )}
                >
                  {tab.icon} {tab.name}
                </div>
              ))}
            {(!isConnected || isConnecting) && (
              <div
                onClick={() => setShouldConnectWithForge(true)}
                className={clsx(
                  isConnecting
                    ? "rdt-pointer-events-none rdt-animate-pulse rdt-cursor-default"
                    : "",
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
          <svg xmlns="http://www.w3.org/2000/svg" onClick={() => setIsOpen(false)} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="rdt-w-6 rdt-h-6 rdt-absolute rdt-right-4 rdt-cursor-pointer rdt-top-1/2 -rdt-translate-y-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
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
              // leftSideOriented ? "rdt-pl-16" : "rdt-pr-16"
            )}
          >
            {tabs.find((t) => t.id === "timeline")?.component}
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

interface RemixDevToolsProps {
  /**
   *  A port to connect to the Remix Forge in your vscode extension
   *  @default 3003
   */
  port?: number;
  /**
   * Whether the dev tools should be open by default
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Whether the dev tools requires a url flag to be shown
   */
  requireUrlFlag?: boolean;
  /**
   * Where the dev tools should be positioned
   * @default "bottom-right"
   */
  position?:
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "middle-right"
  | "middle-left";
  /**
   * Whether the dev tools should show route boundaries
   * @default false
   */
  showRouteBoundaries?: boolean;
}

const RDTWithContext = ({
  port = 3003,
  defaultOpen = false,
  requireUrlFlag,
  showRouteBoundaries = false,
  position = "bottom-right",
}: RemixDevToolsProps) => {
  const hydrated = useHydrated();
  const isDevelopment = isDev();
  const url = useLocation().search;
  useOutletAugment(showRouteBoundaries);

  if (!hydrated || !isDevelopment) return null;

  if (requireUrlFlag && !url.includes("rdt=true")) return null;

  return (
    <RDTContextProvider showRouteBoundaries={showRouteBoundaries} port={port}>
      <RemixDevTools position={position} defaultOpen={defaultOpen} />
    </RDTContextProvider>
  );
};

export { RDTWithContext as RemixDevTools };
