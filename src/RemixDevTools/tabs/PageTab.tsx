import { useMatches, useRevalidator } from "@remix-run/react";
import clsx from "clsx";
import { useMemo } from "react";

import { RouteSegmentInfo } from "../components/RouteSegmentInfo.js";

export const ROUTE_COLORS: Record<string, string> = {
  ROUTE: "rdt-bg-green-500 rdt-text-white",
  LAYOUT: "rdt-bg-blue-500 rdt-text-white",
  ROOT: "rdt-bg-purple-500 rdt-text-white",
};

const PageTab = () => {
  const routes = useMatches();
  const reversed = useMemo(() => routes.reverse(), [routes]);
  const { revalidate, state } = useRevalidator();

  return (
    <div className="rdt-relative rdt-flex rdt-h-full rdt-flex-col rdt-overflow-y-auto rdt-p-6 rdt-px-6">
      <button
        onClick={() => revalidate()}
        className={clsx(
          "rdt-absolute rdt-right-4 rdt-top-0 rdt-z-20 rdt-cursor-pointer rdt-rounded-lg rdt-bg-green-500 rdt-px-3 rdt-py-1 rdt-text-sm rdt-font-semibold rdt-text-white",
          state !== "idle" && "rdt-pointer-events-none rdt-opacity-50"
        )}
      >
        {state !== "idle" ? "Revalidating..." : "Revalidate"}
      </button>
      <ol
        className={clsx(
          "rdt-relative rdt-border-l rdt-border-gray-700",
          state === "loading" && "rdt-pointer-events-none rdt-opacity-50"
        )}
      >
        {reversed.map((route, i) => (
          <RouteSegmentInfo route={route} i={i} key={route.id} />
        ))}
      </ol>
    </div>
  );
};

export { PageTab };
