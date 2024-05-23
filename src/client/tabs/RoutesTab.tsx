import { MouseEvent, useState } from "react";
import { createRouteTree } from "../utils/sanitize.js";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/Accordion.js";
import { useMatches, useNavigate } from "react-router";
import { useDetachedWindowControls, useSettingsContext } from "../context/useRDTContext.js";
import { NewRouteForm } from "../components/NewRouteForm.js";
import { useRemixForgeSocket } from "../hooks/useRemixForgeSocket.js";
import { ExtendedRoute, constructRoutePath, createExtendedRoutes } from "../utils/routing.js";
import { setRouteInLocalStorage } from "../hooks/detached/useListenToRouteChange.js";

import clsx from "clsx";
import { RouteInfo } from "../components/RouteInfo.js";
import { RouteNode } from "../components/RouteNode.js";
import { RouteToggle } from "../components/RouteToggle.js";
import Tree from "../../external/react-d3-tree/index.js";

const RoutesTab = () => {
  const matches = useMatches();
  const navigate = useNavigate();
  const activeRoutes = matches.map((match) => match.id);
  const { settings } = useSettingsContext();
  const { routeWildcards, routeViewMode } = settings;
  const { isConnected } = useRemixForgeSocket();
  const { detachedWindow } = useDetachedWindowControls();
  const [activeRoute, setActiveRoute] = useState<ExtendedRoute | null>(null);
  const [routes] = useState<ExtendedRoute[]>(createExtendedRoutes());
  const [treeRoutes] = useState(createRouteTree(window.__remixManifest.routes));
  const isTreeView = routeViewMode === "tree";
  const openNewRoute = (path: string) => (e?: MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    e?.preventDefault();
    navigate(path);
    if (detachedWindow) {
      setRouteInLocalStorage(path);
    }
  };

  return (
    <div className={clsx("rdt-relative rdt-h-full rdt-w-full ", !isTreeView && "rdt-pt-8")}>
      <RouteToggle />
      {isTreeView ? (
        <div className="rdt-flex rdt-h-full rdt-w-full">
          <Tree
            translate={{ x: window.innerWidth / 2 - (isTreeView && activeRoute ? 0 : 0), y: 30 }}
            pathClassFunc={(link) =>
              activeRoutes.includes((link.target.data.attributes as any).id)
                ? "rdt-stroke-yellow-500"
                : "rdt-stroke-gray-400"
            }
            renderCustomNodeElement={(props) =>
              RouteNode({
                ...props,
                routeWildcards,
                setActiveRoute,
                activeRoutes,
              })
            }
            orientation="vertical"
            data={treeRoutes}
          />
          {activeRoute && (
            <RouteInfo
              openNewRoute={openNewRoute}
              onClose={() => setActiveRoute(null)}
              route={activeRoute}
              className="rdt-w-[600px] rdt-border-l rdt-border-l-slate-800 rdt-p-2 rdt-px-4"
            />
          )}
        </div>
      ) : (
        <Accordion className="rdt-h-full rdt-w-full rdt-overflow-y-auto rdt-pr-4" type="single" collapsible>
          {isConnected && (
            <AccordionItem value="add-new">
              <AccordionTrigger>Add a new route to the project</AccordionTrigger>
              <AccordionContent>
                <NewRouteForm />
              </AccordionContent>
            </AccordionItem>
          )}

          {routes?.map((route) => {
            const { path, pathToOpen } = constructRoutePath(route, routeWildcards);
            return (
              <AccordionItem key={route.id} value={route.id}>
                <AccordionTrigger>
                  <div className="justify-center rdt-flex rdt-w-full rdt-items-center rdt-gap-2">
                    <span className="rdt-text-gray-500">Route:</span> {route.url}{" "}
                    <span className="rdt-ml-auto rdt-text-xs rdt-text-gray-500">Url: "{pathToOpen}"</span>
                    <div
                      title={pathToOpen}
                      className="rdt-mr-2 rdt-whitespace-nowrap rdt-rounded rdt-border rdt-border-gray-400 rdt-px-2 rdt-py-1 rdt-text-sm"
                      onClick={openNewRoute(path)}
                    >
                      Open in browser
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <RouteInfo openNewRoute={openNewRoute} route={route} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export { RoutesTab };
