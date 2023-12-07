import clsx from "clsx";
import { useResize } from "../hooks/useResize.js";
import { useDetachedWindowControls, useSettingsContext } from "../context/useRDTContext.js";
import { useState } from "react";
import { useAttachWindowListener } from "../hooks/useAttachListener.js";
import { useDebounce } from "../hooks/useDebounce.js";

interface MainPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  isEmbedded?: boolean;
  className?: string;
}

const useResizeDetachedPanel = () => {
  const { isDetached } = useDetachedWindowControls();
  const [state, setState] = useState(0);
  const debounce = useDebounce(() => {
    setState(state + 1);
  });
  useAttachWindowListener("resize", debounce, isDetached);
};

const MainPanel = ({ children, isOpen, isEmbedded = false, className }: MainPanelProps) => {
  const { settings } = useSettingsContext();
  const { detachedWindow } = useDetachedWindowControls();
  const { height, panelLocation } = settings;
  const { enableResize, disableResize, isResizing } = useResize();
  useResizeDetachedPanel();

  return (
    <div
      style={{
        zIndex: 9998,
        ...(!isEmbedded && { height: detachedWindow ? window.innerHeight : height }),
      }}
      className={clsx(
        "rdt-duration-600 rdt-box-border rdt-flex rdt-w-screen rdt-flex-col rdt-overflow-auto rdt-bg-main rdt-text-white rdt-opacity-0 rdt-transition-all",
        isOpen ? "rdt-opacity-100 rdt-drop-shadow-2xl" : "rdt-h-0",
        isResizing && "rdt-cursor-grabbing ",
        !isEmbedded
          ? `rdt-fixed rdt-left-0 ${
              panelLocation === "bottom" ? "rdt-bottom-0" : "rdt-top-0 rdt-border-b-2 rdt-border-main"
            }`
          : "",
        className
      )}
    >
      {panelLocation === "bottom" && (
        <div
          onMouseDown={enableResize}
          onMouseUp={disableResize}
          className={clsx(
            "rdt-absolute rdt-z-50 rdt-h-1 rdt-w-full",
            isResizing ? "rdt-cursor-grabbing" : "rdt-cursor-ns-resize"
          )}
        />
      )}
      {children}
      {panelLocation === "top" && (
        <div
          onMouseDown={enableResize}
          onMouseUp={disableResize}
          className={clsx(
            "rdt-absolute rdt-bottom-0 rdt-z-50 rdt-h-1 rdt-w-full",
            isResizing ? "rdt-cursor-grabbing" : "rdt-cursor-ns-resize"
          )}
        />
      )}
    </div>
  );
};

export { MainPanel };
