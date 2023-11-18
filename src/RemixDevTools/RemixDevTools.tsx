import { useEffect, useState } from "react";
import { RDTContextProvider } from "./context/RDTContext.js";
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
import { RdtPlugin } from "../client.js";

const DevTools = ({ plugins: pluginArray }: RemixDevToolsProps) => {
  useTimelineHandler();
  useResetDetachmentCheck();
  useBorderedRoutes();
  useSetRouteBoundaries();
  useSyncStateWhenDetached();
  useDevServerConnection();
  useOpenElementSource();
  const url = useLocation().search;
  const { detachedWindowOwner, isDetached, setDetachedWindowOwner } = useDetachedWindowControls();
  const { settings } = useSettingsContext();
  const { persistOpen } = usePersistOpen();
  const { position } = settings;
  const [isOpen, setIsOpen] = useState(isDetached || settings.defaultOpen || persistOpen);
  const leftSideOriented = position.includes("left");
  const plugins = pluginArray?.map(plugin => typeof plugin === "function" ? plugin() : plugin)
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
          <Tabs plugins={plugins} setIsOpen={setIsOpen} />
          <ContentPanel leftSideOriented={leftSideOriented} plugins={plugins} />
        </MainPanel>
      </div>
    </>
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
  // Additional tabs to add to the dev tools
  plugins?: (Tab | RdtPlugin)[];
}

const RemixDevTools = ({ plugins }: RemixDevToolsProps) => {
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return (
    <RDTContextProvider>
      <DevTools plugins={plugins} />
    </RDTContextProvider>
  );
};

export { RemixDevTools };
