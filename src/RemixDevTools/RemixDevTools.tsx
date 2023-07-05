import clsx from "clsx";
import { Logo } from "./Logo";
import { useEffect, useState } from "react";
import { GitMerge, Package, Server, Terminal } from "lucide-react";
import { RoutesTab } from "./tabs/RoutesTab";
import { TerminalTab } from "./tabs/TerminalTab";
import { ServerTab } from "./tabs/ServerTab";
import { PageTab } from "./tabs/PageTab";

interface RemixDevToolsProps {}

let hydrating = true;

function useHydrated() {
  let [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}

type Tabs = "routes" | "terminal" | "server" | "page";

interface Tab {
  id: Tabs;
  name: string;
  icon: React.ReactNode;
  component: JSX.Element;
}

const RemixDevTools = ({}: RemixDevToolsProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tabs>("page");
  const hydrated = useHydrated();

  if (!hydrated) return null;
  const tabs: Tab[] = [
    {
      name: "Page",
      icon: <Package size={16} />,
      id: "page",
      component: <PageTab />,
    },
    {
      name: "Routes",
      icon: <GitMerge size={16} />,
      id: "routes",
      component: <RoutesTab />,
    },
    {
      name: "Terminal",
      icon: <Terminal size={16} />,
      id: "terminal",
      component: <TerminalTab />,
    },
    {
      name: "Server",
      icon: <Server size={16} />,
      id: "server",
      component: <ServerTab />,
    },
  ];

  const Component = tabs.find((tab) => tab.id === activeTab)?.component;
  return hydrated ? (
    <div className="remix-dev-tools">
      <div
        style={{ zIndex: 9999 }}
        onClick={() => setIsOpen(!isOpen)}
        className={
          "fixed cursor-pointer bottom-0 m-1 w-14 h-14 right-0 rounded-full "
        }
      >
        <Logo
          className={clsx(
            "rounded-full w-14 h-14 duration-200 transition-all",
            "hover:cursor-pointer hover:ring-2 ring-slate-600"
          )}
        />
      </div>

      <div
        style={{ zIndex: 9998 }}
        className={clsx(
          "fixed flex flex-col left-0 box-border bottom-0 transition-all duration-600 opacity-0 bg-[#212121] w-screen text-white",
          isOpen ? "h-96 drop-shadow-2xl opacity-100" : "h-0"
        )}
      >
        <div className="flex h-8 w-full bg-gray-800">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex font-sans transition-all duration-300 items-center gap-2 cursor-pointer border-r-2 px-4 border-0 border-solid border-r-[#212121] border-b border-b-[#212121]",
                activeTab !== tab.id && "hover:opacity-50",
                activeTab === tab.id && "bg-[#212121]"
              )}
            >
              {tab.icon} {tab.name}
            </div>
          ))}
        </div>
        <div className="h-full w-full flex">
          <div className="w-full p-2 pr-16">{Component}</div>
        </div>
      </div>
    </div>
  ) : null;
};

export { RemixDevTools };
