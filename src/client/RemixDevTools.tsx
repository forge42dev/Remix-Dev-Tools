import { useEffect, useState } from "react";
import { RDTContextProvider, RdtClientConfig } from "./context/RDTContext.js";
import { Tab } from "./tabs/index.js";
import { useTimelineHandler } from "./hooks/useTimelineHandler.js";
import { useDetachedWindowControls, usePersistOpen, useSettingsContext } from "./context/useRDTContext.js";
import { useLocation } from "@remix-run/react";
import { Trigger } from "./components/Trigger.js";
import { MainPanel } from "./layout/MainPanel.js";
import { Tabs } from "./layout/Tabs.js";
import { ContentPanel } from "./layout/ContentPanel.js";
import { useBorderedRoutes } from "./hooks/useBorderedRoutes.js";
import { useResetDetachmentCheck } from "./hooks/detached/useResetDetachmentCheck.js";
import { useSetRouteBoundaries } from "./hooks/useSetRouteBoundaries.js";
import {
  REMIX_DEV_TOOLS,
  REMIX_DEV_TOOLS_DETACHED_OWNER,
  REMIX_DEV_TOOLS_IS_DETACHED,
  setSessionItem,
  setStorageItem,
} from "./utils/storage.js";
import { useSyncStateWhenDetached } from "./hooks/detached/useSyncStateWhenDetached.js";
import "../input.css";
import { useDevServerConnection } from "./hooks/useDevServerConnection.js";
import { useOpenElementSource } from "./hooks/useOpenElementSource.js"; 
import { useDebounce } from "./hooks/useDebounce.js";
import { useListenToRouteChange } from "./hooks/detached/useListenToRouteChange.js";
import { RdtPlugin } from "../index.js"; 
import { useHotkeys } from "react-hotkeys-hook";

const recursivelyChangeTabIndex = (node: Element | HTMLElement, remove = true) => {
  if(remove){
    node.setAttribute("tabIndex","-1");
  } else { 
    node.removeAttribute("tabIndex");
  }
  for(const child of node.children) { 
    recursivelyChangeTabIndex(child, remove);
  } 
};

const DevTools = ({ plugins: pluginArray }: RemixDevToolsProps) => {
  useTimelineHandler();
  useResetDetachmentCheck();
  useBorderedRoutes();
  useSetRouteBoundaries();
  useSyncStateWhenDetached();
  useDevServerConnection();
  useOpenElementSource();
  useListenToRouteChange();
  
  const { setPersistOpen } = usePersistOpen();
  const url = useLocation().search;
  const { detachedWindowOwner, isDetached, setDetachedWindowOwner } = useDetachedWindowControls();
  const { settings } = useSettingsContext();
  const { persistOpen } = usePersistOpen();
  const { position } = settings;
  const [isOpen, setIsOpen] = useState(isDetached || settings.defaultOpen || persistOpen);
  const leftSideOriented = position.includes("left");
  const plugins = pluginArray?.map((plugin) => (typeof plugin === "function" ? plugin() : plugin));
  const debounceSetOpen = useDebounce(() => {setIsOpen(!isOpen); setPersistOpen(!isOpen)}, 100);
  useHotkeys(settings.openHotkey, () => debounceSetOpen());
  useHotkeys("esc", () =>  isOpen ? debounceSetOpen() : null);

  useEffect(() => {
    const el = document.getElementById(REMIX_DEV_TOOLS);
    if(!el) return;
    recursivelyChangeTabIndex(el , !isOpen); 
  },[isOpen])  

  if (settings.requireUrlFlag && !url.includes(settings.urlFlag)) return null;
  // If the dev tools are detached, we don't want to render the main panel
  if (detachedWindowOwner) {
    return (
      <div id={REMIX_DEV_TOOLS} className="remix-dev-tools">
        <Trigger
          isOpen={false}
          setIsOpen={() => {
            setDetachedWindowOwner(false);
            setStorageItem(REMIX_DEV_TOOLS_IS_DETACHED, "false");
            setSessionItem(REMIX_DEV_TOOLS_DETACHED_OWNER, "false");
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div id={REMIX_DEV_TOOLS} className="remix-dev-tools">
        <Trigger isOpen={isOpen} setIsOpen={setIsOpen} />
        <MainPanel isOpen={isOpen}>
          <div className="rdt-flex rdt-h-full">
            <Tabs plugins={plugins} setIsOpen={setIsOpen} />
            <ContentPanel leftSideOriented={leftSideOriented} plugins={plugins} />
          </div>
        </MainPanel>
      </div>
    </>
  );
};



export interface RemixDevToolsProps {
  // Additional tabs to add to the dev tools
  plugins?: (Tab | RdtPlugin)[];
  config?: RdtClientConfig;
}

const RemixDevTools = ({ plugins, config }: RemixDevToolsProps) => {
  return (
    <RDTContextProvider  config={config}>
      <DevTools plugins={plugins} />
    </RDTContextProvider>
  );
};

export { RemixDevTools };
