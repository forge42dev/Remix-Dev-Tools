import { MouseEvent, useState } from "react";
import { createRouteTree } from "../utils/sanitize.js";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/Accordion.js";
import { useMatches, useNavigate } from "@remix-run/react";
import { useDetachedWindowControls, useSettingsContext } from "../context/useRDTContext.js";
import { NewRouteForm } from "../components/NewRouteForm.js";
import { useRemixForgeSocket } from "../hooks/useRemixForgeSocket.js";
import { ExtendedRoute, constructRoutePath, createExtendedRoutes } from "../utils/routing.js";
import { setRouteInLocalStorage } from "../hooks/detached/useListenToRouteChange.js";

import clsx from "clsx";
import { RouteInfo } from "../components/RouteInfo.js";
import { RouteNode } from "../components/RouteNode.js";
import { RouteToggle } from "../components/RouteToggle.js";
import Tree from "react-d3-tree";

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
    <div className={clsx("relative h-full w-full ", !isTreeView && "pt-8")}>
      <RouteToggle />
      {isTreeView ? (
        <div className="flex h-full w-full">
          <Tree
            translate={{ x: window.innerWidth / 2 - (isTreeView && activeRoute ? 0 : 0), y: 30 }}
            pathClassFunc={(link) =>
              activeRoutes.includes((link.target.data.attributes as any).id)
                ? "stroke-yellow-500"
                : "stroke-gray-400"
            }
            renderCustomNodeElement={(props) =>
              RouteNode({
                ...props,
                routeWildcards,
                setActiveRoute,
                activeRoutes,
                navigate
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
              className="w-[600px] border-l border-l-slate-800 p-2 px-4"
            />
          )}
        </div>
      ) : (
        <Accordion className="h-full w-full overflow-y-auto pr-4" type="single" collapsible>
          {isConnected && (
            <AccordionItem value="add-new">
              <AccordionTrigger className="text-white">Add a new route to the project</AccordionTrigger>
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
                  <div className="justify-center text-white flex w-full items-center gap-2">
                    <span className="text-gray-500">Route:</span> {route.url}{" "}
                    <span className="ml-auto text-xs text-gray-500">Url: "{pathToOpen}"</span>
                    <div
                      title={pathToOpen}
                      className="mr-2 whitespace-nowrap rounded border border-gray-400 px-2 py-1 text-sm"
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
