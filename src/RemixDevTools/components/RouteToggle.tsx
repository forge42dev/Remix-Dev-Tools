import clsx from "clsx";
import { useSettingsContext } from '../context/useRDTContext.js';
import networkURL from "../icons/network.svg";
import listURL from "../icons/list.svg";

export const RouteToggle = () => {
  const { settings, setSettings } = useSettingsContext();
  const { routeViewMode } = settings;
  return (
    <div className="rdt-absolute rdt-left-0 rdt-top-0 rdt-flex rdt-items-center rdt-gap-2 rdt-rounded-lg rdt-border rdt-border-white rdt-px-3 rdt-py-1">
      <svg
        className={clsx("hover:rdt-cursor-pointer rdt-h-5 rdt-w-5", routeViewMode === "tree" && "rdt-stroke-yellow-500")}
        onClick={() => setSettings({ routeViewMode: "tree" })}
      >
        <use href={networkURL + "#icon"} />
      </svg>
      /
      <svg
        className={clsx("hover:rdt-cursor-pointer rdt-h-5 rdt-w-5", routeViewMode === "list" && "rdt-stroke-yellow-500")}
        onClick={() => setSettings({ routeViewMode: "list" })}
      >
        <use href={listURL + "#icon"} />
      </svg>
    </div>
  );
};
