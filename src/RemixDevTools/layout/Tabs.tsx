import clsx from "clsx";
import { Radio } from "lucide-react";
import { useRDTContext } from "../context/useRDTContext";
import { useRemixForgeSocket } from "../hooks/useRemixForgeSocket";
import { useTabs } from "../hooks/useTabs";
import { Tab, Tabs as TabType } from "../tabs";

interface TabsProps {
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
        "rdt-flex rdt-cursor-pointer rdt-items-center rdt-gap-2 rdt-border-0 rdt-border-b rdt-border-r-2 rdt-border-solid rdt-border-b-[#212121] rdt-border-r-[#212121] rdt-px-4 rdt-font-sans rdt-transition-all rdt-duration-300",
        activeTab !== tab.id && "rdt-hover:opacity-50",
        activeTab === tab.id && "rdt-bg-[#212121]",
        className
      )}
    >
      {tab.icon} {tab.name}
    </div>
  );
};

const Tabs = ({ additionalTabs }: TabsProps) => {
  const { activeTab, setActiveTab, setShouldConnectWithForge } =
    useRDTContext();
  const { isConnected, isConnecting } = useRemixForgeSocket();
  const { visibleTabs } = useTabs(isConnected, isConnecting, additionalTabs);
  const shouldShowConnectToForge = !isConnected || isConnecting;
  return (
    <div className="rdt-flex rdt-h-8 rdt-w-full rdt-bg-gray-800">
      {visibleTabs.map((tab) => (
        <Tab
          key={tab.id}
          tab={tab}
          onClick={setActiveTab}
          activeTab={activeTab}
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
            component: <></>,
            icon: <Radio size={16} />,
          }}
          className={clsx(
            isConnecting &&
              "rdt-pointer-events-none rdt-animate-pulse rdt-cursor-default",
            "rdt-flex rdt-cursor-pointer rdt-items-center rdt-gap-2 rdt-border-0 rdt-border-b rdt-border-r-2 rdt-border-solid rdt-border-b-[#212121] rdt-border-r-[#212121] rdt-px-4 rdt-font-sans rdt-transition-all"
          )}
          onClick={() => setShouldConnectWithForge(true)}
        />
      )}
    </div>
  );
};

export { Tabs };
