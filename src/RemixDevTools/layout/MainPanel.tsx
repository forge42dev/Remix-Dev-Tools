import clsx from "clsx";
import { useResize } from "../hooks/useResize";
import { useRDTContext } from "../context/useRDTContext";

interface MainPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
}

const MainPanel = ({ children, isOpen }: MainPanelProps) => {
  const { height } = useRDTContext();
  const { enableResize, disableResize, isResizing } = useResize();
  return (
    <div
      style={{ zIndex: 9998, height }}
      className={clsx(
        "rdt-duration-600 rdt-fixed rdt-bottom-0 rdt-left-0 rdt-box-border rdt-flex rdt-w-screen rdt-resize-y rdt-flex-col rdt-overflow-auto rdt-bg-[#212121] rdt-text-white rdt-opacity-0 rdt-transition-all",
        isOpen ? "rdt-opacity-100 rdt-drop-shadow-2xl" : "rdt-h-0",
        isResizing ? "rdt-pointer-events-none" : "",
        isResizing && "rdt-cursor-grabbing "
      )}
    >
      <div
        onMouseDown={enableResize}
        onMouseUp={disableResize}
        className={clsx(
          "rdt-absolute rdt-h-1 rdt-w-full rdt-cursor-n-resize",
          isResizing && "rdt-cursor-grabbing "
        )}
      />
      {children}
    </div>
  );
};

export { MainPanel };
