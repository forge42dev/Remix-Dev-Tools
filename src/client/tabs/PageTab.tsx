import { useMatches, useRevalidator } from "@remix-run/react";
import clsx from "clsx";
import { useMemo } from "react";

import { RouteSegmentInfo } from "../components/RouteSegmentInfo.js";

export const ROUTE_COLORS: Record<string, string> = {
  ROUTE: "bg-green-500 text-white",
  LAYOUT: "bg-blue-500 text-white",
  ROOT: "bg-purple-500 text-white",
};

const PageTab = () => {
  const routes = useMatches();
  const reversed = useMemo(() => routes.reverse(), [routes]);
  const { revalidate, state } = useRevalidator();

  return (
    <>
      <div className="sticky top-0 z-30 mb-2 bg-[#212121] pt-2">
        <div className="mb-1 flex justify-between ">
          <h1 className="text-lg">Active Route Segments</h1>
          <button
            onClick={() => revalidate()}
            className={clsx(
              "  z-20 cursor-pointer rounded-lg border border-green-500 px-3 py-1 text-sm font-semibold text-white",
              state !== "idle" && "pointer-events-none opacity-50"
            )}
          >
            {state !== "idle" ? "Revalidating..." : "Revalidate"}
          </button>
        </div>
        <hr className="border-gray-700" />
      </div>
      <div className="relative flex h-full flex-col p-6 px-6">
        <ol
          className={clsx(
            "relative border-l border-gray-700",
            state === "loading" && "pointer-events-none opacity-50"
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
