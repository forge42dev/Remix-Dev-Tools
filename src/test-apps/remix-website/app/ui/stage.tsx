// TODO: make `pages` optional and measure the div when unspecified, this will
// allow more normal document flow and make it easier to do both mobile and
// desktop.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { canUseDOM, useHydrated } from "./primitives/utils";

////////////////////////////////////////////////////////////////////////////////
interface TStageProps {
  frame: number;
  length: number;
  children: React.ReactNode;
  DEBUG?: boolean;
}

interface TActorProps {
  type?: "progress" | "frame";
  start: number;
  end?: number;
  persistent?: boolean;
  children: React.ReactNode;
}

interface TScrollStageProps {
  pages: number;
  fallbackFrame?: number;
  fallbackLength?: number;
  children: React.ReactNode;
  DEBUG?: boolean;
}

interface TFrame {
  isDefault?: boolean;
  frame: number;
  progress: number;
  length: number;
}

////////////////////////////////////////////////////////////////////////////////
let StageContext = createContext<TFrame>({
  isDefault: true,
  frame: 0,
  progress: 0,
  length: 0,
});

let ActorContext = createContext<TFrame>({
  isDefault: true,
  frame: 0,
  progress: 0,
  length: 0,
});

////////////////////////////////////////////////////////////////////////////////
export function Stage({ frame, length, DEBUG, children }: TStageProps) {
  let progress = frame / length;
  let context = useMemo(() => {
    let context: TFrame = { frame, progress, length };
    return context;
  }, [frame, progress, length]);
  if (DEBUG) console.log(context);
  return <StageContext.Provider value={context} children={children} />;
}

export function Actor({
  type = "progress",
  start: startProp,
  end: endProp,
  persistent = false,
  children,
}: TActorProps) {
  let stage = useContext(StageContext);
  let actor = useActor();
  let parent = actor.isDefault ? stage : actor;

  let start = type === "progress" ? startProp * parent.length : startProp;
  let end = endProp
    ? type === "progress"
      ? endProp * parent.length
      : endProp
    : parent.length;

  let length = end - start;
  let frame = parent.frame - start;
  let progress = Math.max(0, Math.min(frame / length, 1));

  let context = useMemo(() => {
    let context: TFrame = { frame, progress, length };
    return context;
  }, [frame, progress, length]);

  let onStage = persistent
    ? true
    : parent.frame >= start && (endProp ? parent.frame < end : true);

  return onStage ? (
    <ActorContext.Provider value={context} children={children} />
  ) : null;
}

function getStageLength(pages: number) {
  return window.innerHeight * pages;
}

export function ScrollStage({
  pages,
  fallbackFrame = 0,
  fallbackLength = 1080,
  DEBUG = false,
  children,
}: TScrollStageProps) {
  let ref = useRef<HTMLDivElement>(null);
  let relativeScroll = useRelativeWindowScroll(ref, fallbackFrame);
  let hydrated = useHydrated();

  let [length, setLength] = useState<number>(() => {
    return hydrated ? getStageLength(pages) : fallbackLength;
  });

  // set length after server render
  useEffect(() => setLength(getStageLength(pages)), [pages]);
  useOnResize(useCallback(() => setLength(getStageLength(pages)), [pages]));

  return (
    <Stage
      frame={Math.max(0, Math.min(relativeScroll, length))}
      length={length}
      DEBUG={DEBUG}
    >
      <div ref={ref} style={{ height: `${pages * 100}vh` }}>
        {children}
      </div>
    </Stage>
  );
}

export function useActor(): TFrame {
  return useContext(ActorContext);
}

export function useStage(): TFrame {
  return useContext(StageContext);
}

function useOnResize(fn: () => void) {
  useEffect(() => {
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [fn]);
}

function useWindowScroll(fallback: number = 0): number {
  let hydrated = useHydrated();
  let [scroll, setScroll] = useState<number>(
    hydrated && canUseDOM ? window.scrollY : fallback,
  );
  let handleScroll = useCallback(() => {
    setScroll(window.scrollY);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useOnResize(handleScroll);

  return scroll;
}

function useRelativeWindowScroll(
  ref: React.RefObject<HTMLElement>,
  fallback: number = 0,
): number {
  let windowScroll = useWindowScroll(fallback);
  if (!ref.current) return fallback;
  return (
    // windowScroll - ref.current.offsetTop + document.documentElement.clientHeight
    windowScroll - ref.current.offsetTop + window.innerHeight
    // windowScroll - ref.current.offsetTop
  );
}
