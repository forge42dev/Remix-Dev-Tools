import clsx from "clsx";
import { Radio } from "lucide-react";
import { useRDTContext } from "../context/useRDTContext";
import { useRemixForgeSocket } from "../hooks/useRemixForgeSocket";
import { useTabs } from "../hooks/useTabs";
import { Tab, Tabs as TabType } from "../tabs";
import { useHorizontalScroll } from "../hooks/useHorizontalScroll";

interface TabsProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  additionalTabs?: Tab[];
}

const Tab = ({
  tab,
  onClick,
  activeTab,
  className,
}: {
  tab: Tab;
  onClick: (tabId: TabType) => void;
  activeTab?: string;
  className?: string;
}) => {
  return (
    <div
      onClick={() => onClick(tab.id as TabType)}
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

const Tabs = ({ additionalTabs, setIsOpen }: TabsProps) => {
  const { activeTab, setActiveTab, setShouldConnectWithForge, setPersistOpen } =
    useRDTContext();
  const { isConnected, isConnecting } = useRemixForgeSocket();
  const { visibleTabs } = useTabs(isConnected, isConnecting, additionalTabs);
  const shouldShowConnectToForge = !isConnected || isConnecting;
  const scrollRef = useHorizontalScroll();

  return (
    <div className="rdt-relative rdt-flex rdt-h-8 rdt-w-full rdt-bg-gray-800">
      <div
        ref={scrollRef}
        className="remix-dev-tools-tab rdt-mr-10 rdt-flex rdt-h-full rdt-w-full rdt-overflow-x-auto rdt-overflow-y-hidden"
      >
        {visibleTabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={tab}
            onClick={setActiveTab}
            activeTab={activeTab}
            className="rdt-duration-300"
          />
        ))}
        {shouldShowConnectToForge && (
          <Tab
            tab={{
              id: "connect",
              name: isConnecting
                ? "Connecting to Forge..."
                : "Connect to Remix Forge",
              requiresForge: false,
              hideTimeline: false,
              component: <></>,
              icon: <Radio size={16} />,
            }}
            className={clsx(
              isConnecting &&
                "rdt-pointer-events-none rdt-animate-pulse rdt-cursor-default",
              "rdt-ml-auto rdt-flex rdt-shrink-0 rdt-cursor-pointer rdt-items-center rdt-gap-2 rdt-border-0 rdt-border-b rdt-border-r-2 rdt-border-solid rdt-border-b-[#212121] rdt-border-r-[#212121] rdt-px-4 rdt-font-sans rdt-transition-all"
            )}
            onClick={() => setShouldConnectWithForge(true)}
          />
        )}
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        onClick={() => {
          setPersistOpen(false);
          setIsOpen(false);
        }}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="rdt-absolute rdt-right-2 rdt-top-1/2 rdt-h-6 rdt-w-6 -rdt-translate-y-1/2 rdt-cursor-pointer rdt-transition-all hover:rdt-text-red-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  );
};

export { Tabs };
