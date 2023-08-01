import { useEffect, useState } from "react";
import { RDTContextProvider } from "./context/RDTContext";
import { Tab } from "./tabs";
import { useTimelineHandler } from "./hooks/useTimelineHandler";
import { useRDTContext } from "./context/useRDTContext";
import { isDev } from "./utils/isDev";
import { useLocation } from "@remix-run/react";
import { Trigger } from "./components/Trigger";
import { MainPanel } from "./layout/MainPanel";
import { Tabs } from "./layout/Tabs";
import { ContentPanel } from "./layout/ContentPanel";
import rdtStylesheet from "../input.css?inline";
interface Props extends RemixDevToolsProps {
  defaultOpen: boolean;
  position: Exclude<RemixDevToolsProps["position"], undefined>;
  hideUntilHover: boolean;
}
const InjectedStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: rdtStylesheet }} />
);
const RemixDevTools = ({
  defaultOpen,
  position,
  additionalTabs,
  hideUntilHover,
}: Props) => {
  useTimelineHandler();
  const { persistOpen } = useRDTContext();
  const [isOpen, setIsOpen] = useState(defaultOpen || persistOpen);
  const leftSideOriented = position.includes("left");

  return (
    <div className="remix-dev-tools">
      <Trigger
        isOpen={isOpen}
        position={position}
        hideUntilHover={hideUntilHover}
        setIsOpen={setIsOpen}
      />
      <MainPanel isOpen={isOpen}>
        <Tabs additionalTabs={additionalTabs} setIsOpen={setIsOpen} />
        <ContentPanel
          leftSideOriented={leftSideOriented}
          additionalTabs={additionalTabs}
        />
      </MainPanel>
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
  // Additional tabs to add to the dev tools
  additionalTabs?: Tab[];
  // Whether the dev tools trigger should hide until hovered
  hideUntilHover?: boolean;
  // min height of the dev tools
  minHeight?: number;
  // max height of the dev tools
  maxHeight?: number;
}

const RDTWithContext = ({
  port = 3003,
  defaultOpen = false,
  requireUrlFlag,
  position = "bottom-right",
  hideUntilHover = false,
  additionalTabs,
  minHeight = 200,
  maxHeight = 600,
}: RemixDevToolsProps) => {
  const hydrated = useHydrated();
  const isDevelopment = isDev();
  const url = useLocation().search;

  if (!hydrated || !isDevelopment) return null;
  if (requireUrlFlag && !url.includes("rdt=true")) return null;

  return (
    <RDTContextProvider minHeight={minHeight} maxHeight={maxHeight} port={port}>
      <InjectedStyles />
      <RemixDevTools
        defaultOpen={defaultOpen}
        position={position}
        additionalTabs={additionalTabs}
        hideUntilHover={hideUntilHover}
      />
    </RDTContextProvider>
  );
};

export { RDTWithContext as RemixDevTools };
