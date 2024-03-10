import clsx from "clsx";
import { RouteWildcards } from "../context/rdtReducer.js";
import { ExtendedRoute, getRouteColor } from "../utils/routing.js";
import { CustomNodeElementProps } from "../../external/react-d3-tree/index.js";

export const RouteNode = ({
  nodeDatum,
  hierarchyPointNode,
  toggleNode,
  setActiveRoute,
  activeRoutes,
}: CustomNodeElementProps & {
  routeWildcards: RouteWildcards;
  setActiveRoute: (e: ExtendedRoute) => void;
  activeRoutes: string[];
}) => {
  const parent = hierarchyPointNode.parent?.data;
  const parentName = parent && parent?.name !== "/" ? parent.name : "";
  const name = nodeDatum.name.replace(parentName, "") ?? "/";
  const route = { ...nodeDatum, ...nodeDatum.attributes } as any as ExtendedRoute;
  return (
    <g className="rdt-flex">
      <circle
        x={20}
        onClick={toggleNode}
        className={clsx(
          getRouteColor(route),
          "rdt-stroke-white",
          nodeDatum.__rd3t.collapsed && nodeDatum.children?.length && "rdt-fill-gray-800"
        )}
        r={12}
      ></circle>
      <g>
        <foreignObject y={-15} x={17} width={110} height={140}>
          <p
            onClick={() => setActiveRoute(route)}
            style={{ width: 100, fontSize: 14 }}
            className={clsx(
              "rdt-w-full rdt-break-all rdt-fill-white rdt-stroke-transparent",
              activeRoutes.includes(route.id) && "rdt-text-yellow-500"
            )}
          >
            {nodeDatum.attributes?.id === "root" ? "Root" : name ? name : "Index"}
          </p>
        </foreignObject>
      </g>
    </g>
  );
};
