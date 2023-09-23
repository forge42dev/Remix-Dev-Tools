import clsx from "clsx";
import { Network, List } from "lucide-react";
import { useSettingsContext } from '../context/useRDTContext.js';

export const RouteToggle = () => {
  const { settings, setSettings } = useSettingsContext();
  const { routeViewMode } = settings;
  return (
    <div className="rdt-absolute rdt-left-0 rdt-top-0 rdt-flex rdt-items-center rdt-gap-2 rdt-rounded-lg rdt-border rdt-border-white rdt-px-3 rdt-py-1">
      <Network
        className={clsx("hover:rdt-cursor-pointer", routeViewMode === "tree" && "rdt-stroke-yellow-500")}
        onClick={() => setSettings({ routeViewMode: "tree" })}
        size={20}
      />
      /
      <List
        className={clsx("hover:rdt-cursor-pointer", routeViewMode === "list" && "rdt-stroke-yellow-500")}
        onClick={() => setSettings({ routeViewMode: "list" })}
        size={20}
      />
    </div>
  );
};
