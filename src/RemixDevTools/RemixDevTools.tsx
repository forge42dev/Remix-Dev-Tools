import { useEffect, useState } from "react";
import { RDTContextProvider } from "./context/RDTContext";
import { Tab } from "./tabs";
import { useTimelineHandler } from "./hooks/useTimelineHandler";
import { useDetachedWindowControls, usePersistOpen, useSettingsContext } from "./context/useRDTContext";
import { useLocation } from "@remix-run/react";
import { Trigger } from "./components/Trigger";
import { MainPanel } from "./layout/MainPanel";
import { Tabs } from "./layout/Tabs";
import { ContentPanel } from "./layout/ContentPanel";
import rdtStylesheet from "../input.css?inline";
import { useOutletAugment } from "./hooks/useOutletAugment";
import { useSetUnloadDetachedWindowChecks } from "./hooks/detached/useSetUnloadDetachedWindowChecks";
import { useSetRouteBoundaries } from "./hooks/useSetRouteBoundaries";
import { REMIX_DEV_TOOLS } from "./utils/storage";

type Props = RemixDevToolsProps;

const InjectedStyles = () => <style dangerouslySetInnerHTML={{ __html: rdtStylesheet }} />;

const RemixDevTools = ({ plugins }: Props) => {
  useTimelineHandler();
  useOutletAugment();
  useSetUnloadDetachedWindowChecks();
  useSetRouteBoundaries();
  const { detachedWindowOwner } = useDetachedWindowControls();
  const { settings } = useSettingsContext();
  const { persistOpen } = usePersistOpen();
  const { position } = settings;
  const [isOpen, setIsOpen] = useState(settings.defaultOpen || persistOpen);
  const leftSideOriented = position.includes("left");

  // If the dev tools are detached, we don't want to render the main panel
  if (detachedWindowOwner) {
    return null;
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
  // Whether the dev tools require a url flag to be shown
  requireUrlFlag?: boolean;

  // Additional tabs to add to the dev tools
  plugins?: Tab[];
}

const RDTWithContext = ({ requireUrlFlag, plugins }: RemixDevToolsProps) => {
  const hydrated = useHydrated();
  const url = useLocation().search;

  if (!hydrated) return null;
  if (requireUrlFlag && !url.includes("rdt=true")) return null;

  return (
    <RDTContextProvider>
      <InjectedStyles />
      <RemixDevTools plugins={plugins} />
    </RDTContextProvider>
  );
};

export { RDTWithContext as RemixDevTools };
