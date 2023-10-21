import clsx from "clsx";
import { useSettingsContext } from "../context/useRDTContext.js";
import { Icon } from "./icon/Icon.js";

export const RouteToggle = () => {
  const { settings, setSettings } = useSettingsContext();
  const { routeViewMode } = settings;
  return (
    <div className="rdt-absolute rdt-left-0 rdt-top-0 rdt-flex rdt-items-center rdt-gap-2 rdt-rounded-lg rdt-border rdt-border-white rdt-px-3 rdt-py-1">
      <Icon
        className={clsx("rdt-h-5 rdt-w-5 hover:rdt-cursor-pointer", routeViewMode === "tree" && "rdt-text-yellow-500")}
        onClick={() => setSettings({ routeViewMode: "tree" })}
        name="Network"
      />
      /
      <Icon
        name="List"
        className={clsx("rdt-h-5 rdt-w-5 hover:rdt-cursor-pointer", routeViewMode === "list" && "rdt-text-yellow-500")}
        onClick={() => setSettings({ routeViewMode: "list" })}
      />
    </div>
  );
};
