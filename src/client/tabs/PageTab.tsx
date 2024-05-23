import { useMatches, useRevalidator } from "react-router";
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
    <>
      <div className="rdt-sticky rdt-top-0 rdt-z-30 rdt-mb-2 rdt-bg-[#212121] rdt-pt-2">
        <div className="rdt-mb-1 rdt-flex rdt-justify-between ">
          <h1 className="rdt-text-lg">Active Route Segments</h1>
          <button
            onClick={() => revalidate()}
            className={clsx(
              "  rdt-z-20 rdt-cursor-pointer rdt-rounded-lg rdt-border rdt-border-green-500 rdt-px-3 rdt-py-1 rdt-text-sm rdt-font-semibold rdt-text-white",
              state !== "idle" && "rdt-pointer-events-none rdt-opacity-50"
            )}
          >
            {state !== "idle" ? "Revalidating..." : "Revalidate"}
          </button>
        </div>
        <hr className="rdt-border-gray-700" />
      </div>
      <div className="rdt-relative rdt-flex rdt-h-full rdt-flex-col rdt-p-6 rdt-px-6">
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
    </>
  );
};

export { PageTab };
