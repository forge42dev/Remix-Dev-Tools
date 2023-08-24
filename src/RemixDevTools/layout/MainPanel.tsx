import clsx from "clsx";
import { useResize } from "../hooks/useResize";
import { useDetachedWindowControls, useSettingsContext } from "../context/useRDTContext";
import { useState } from "react";
import { useAttachWindowListener } from "../hooks/useAttachListener";
import { useDebounce } from "../hooks/useDebounce";

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
  const { height } = settings;
  const { enableResize, disableResize, isResizing } = useResize();
  useResizeDetachedPanel();

  return (
    <div
      style={{
        zIndex: 9998,
        ...(!isEmbedded && { height: detachedWindow ? window.innerHeight : height }),
      }}
      className={clsx(
        "rdt-duration-600 rdt-box-border rdt-flex rdt-w-screen rdt-flex-col rdt-overflow-auto rdt-bg-[#212121] rdt-text-white rdt-opacity-0 rdt-transition-all",
        isOpen ? "rdt-opacity-100 rdt-drop-shadow-2xl" : "rdt-h-0",
        isResizing && "rdt-cursor-grabbing ",
        !isEmbedded && "rdt-fixed rdt-bottom-0 rdt-left-0",
        className
      )}
    >
      <div
        onMouseDown={enableResize}
        onMouseUp={disableResize}
        className={clsx(
          "rdt-absolute rdt-z-50 rdt-h-1 rdt-w-full",
          isResizing ? "rdt-cursor-grabbing" : "rdt-cursor-ns-resize"
        )}
      />
      {children}
    </div>
  );
};

export { MainPanel };
