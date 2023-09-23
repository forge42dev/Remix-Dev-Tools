import clsx from "clsx";
import { Input } from './Input.js';
import { useSettingsContext } from '../context/useRDTContext.js';
import { ExtendedRoute, constructRoutePath } from '../utils/routing.js';
import type { MouseEvent } from "react";
import { Tag } from './Tag.js';
import { X } from "lucide-react";

interface RouteInfoProps {
  route: ExtendedRoute;
  className?: string;
  openNewRoute: (path: string) => (e?: MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
  onClose?: () => void;
}

export const RouteInfo = ({ route, className, openNewRoute, onClose }: RouteInfoProps) => {
  const { settings, setSettings } = useSettingsContext();
  const { routeWildcards, routeViewMode } = settings;
  const { hasWildcard, path, pathToOpen } = constructRoutePath(route, routeWildcards);
  const isTreeView = routeViewMode === "tree";
  const hasParentErrorBoundary =
    route.errorBoundary.errorBoundaryId && route.errorBoundary.errorBoundaryId !== route.id;
  const hasErrorBoundary = route.errorBoundary.hasErrorBoundary;
  return (
    <div className={clsx(className, "rdt-relative")}>
      {isTreeView && (
        <>
          <X onClick={onClose} className="rdt-absolute rdt-right-2 rdt-top-2 rdt-cursor-pointer rdt-text-red-600" />
          <h1 className="rdt-text-xl rdt-font-semibold">{route.url}</h1>
          <hr className="rdt-mb-4 rdt-mt-1" />
          <h3>
            <span className="rdt-text-gray-500">Path:</span> {path}
          </h3>
          <h3>
            <span className="rdt-text-gray-500">Url:</span> {pathToOpen}
          </h3>
        </>
      )}
      <div className="rdt-flex rdt-gap-2">
        <span className="rdt-text-gray-500">Key:</span>
        {route.id}
      </div>
      <div className="rdt-mb-4 rdt-mt-4 rdt-flex rdt-flex-col rdt-gap-2">
        <span className="rdt-text-gray-500">Components contained in the route:</span>
        <div className="rdt-flex rdt-gap-2">
          <Tag color={route.hasLoader ? "GREEN" : "RED"}>Loader</Tag>
          <Tag color={route.hasAction ? "GREEN" : "RED"}>Action</Tag>

          <div
            className={clsx(
              "rdt-flex rdt-gap-2 rdt-rounded-md rdt-border",
              !hasErrorBoundary ? "rdt-border-red-500" : "rdt-border-green-500"
            )}
          >
            <Tag
              className={clsx(hasErrorBoundary && "rdt-rounded-br-none rdt-rounded-tr-none")}
              color={hasErrorBoundary ? "GREEN" : "RED"}
            >
              ErrorBoundary
            </Tag>
            {hasErrorBoundary ? (
              <div className="rdt-mr-2">
                {hasParentErrorBoundary
                  ? `Covered by parent ErrorBoundary: ${route.errorBoundary.errorBoundaryId}`
                  : "Contains ErrorBoundary"}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {hasWildcard && (
        <>
          <p className="rdt-mb-2 rdt-text-gray-500">Wildcard parameters:</p>
          <div
            className={clsx("rdt-mb-4 rdt-grid rdt-w-full rdt-grid-cols-2 rdt-gap-2", isTreeView && "rdt-grid-cols-1")}
          >
            {route.url
              .split("/")
              .filter((p) => p.startsWith(":"))
              .map((param) => (
                <div key={param} className="rdt-flex rdt-w-full rdt-gap-2">
                  <Tag key={param} color="BLUE">
                    {param}
                  </Tag>
                  <Input
                    value={routeWildcards[route.id]?.[param] || ""}
                    onChange={(e) =>
                      setSettings({
                        routeWildcards: {
                          ...routeWildcards,
                          [route.id]: {
                            ...routeWildcards[route.id],
                            [param]: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder={param}
                  />
                </div>
              ))}
          </div>
        </>
      )}
      {isTreeView && (
        <button
          className="rdt-mr-2 rdt-whitespace-nowrap rdt-rounded rdt-border rdt-border-gray-400 rdt-px-2 rdt-py-1 rdt-text-sm"
          onClick={openNewRoute(path)}
        >
          Open in browser
        </button>
      )}
    </div>
  );
};
