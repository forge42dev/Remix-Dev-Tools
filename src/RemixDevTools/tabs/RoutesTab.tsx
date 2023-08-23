import { MouseEvent, useState } from "react";
import { EntryRoute } from "@remix-run/react/dist/routes";
import { convertRemixPathToUrl, createRouteTree } from "../utils/sanitize";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/Accordion";
import { useNavigate } from "@remix-run/react";
import { Tag } from "../components/Tag";
import { useDetachedWindowControls, useSettingsContext } from "../context/useRDTContext";
import { Input } from "../components/Input";
import { NewRouteForm } from "../components/NewRouteForm";
import { useRemixForgeSocket } from "../hooks/useRemixForgeSocket";
import { isLeafRoute } from "../utils/routing";
import { setRouteInLocalStorage } from "../hooks/detached/useListenToRouteChange";
import Tree from "react-d3-tree";

const RoutesTab = () => {
  const { settings, setSettings } = useSettingsContext();
  const { routeWildcards } = settings;
  const { isConnected } = useRemixForgeSocket();
  const { detachedWindow } = useDetachedWindowControls();
  const [routes] = useState<(EntryRoute & { route: string })[]>(
    Object.values(window.__remixManifest.routes)
      .map((route) => {
        return {
          ...route,
          route: convertRemixPathToUrl(window.__remixManifest.routes, route),
        };
      })
      .filter((route) => isLeafRoute(route))
  );
  const [treeRoutes] = useState(createRouteTree(window.__remixManifest.routes));
  const navigate = useNavigate();

  const openNewRoute = (path: string) => (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    navigate(path);
    if (detachedWindow) {
      setRouteInLocalStorage(path);
    }
  };

  return (
    <Accordion className="rdt-h-full rdt-w-full rdt-overflow-y-auto rdt-pr-4" type="single" collapsible>
      {isConnected && (
        <AccordionItem value="add-new">
          <AccordionTrigger>Add a new route to the project</AccordionTrigger>
          <AccordionContent>
            <NewRouteForm />
          </AccordionContent>
        </AccordionItem>
      )}
      <Tree orientation="vertical" data={treeRoutes} />
      {routes?.map((route) => {
        const hasWildcard = route.route.includes(":");
        const wildcards = routeWildcards[route.id];
        const path = route.route
          .split("/")
          .map((p) => {
            if (p.startsWith(":")) {
              return wildcards?.[p] ? wildcards?.[p] : p;
            }
            return p;
          })
          .join("/");
        const pathToOpen = document.location.origin + (path === "/" ? path : "/" + path);
        return (
          <AccordionItem key={route.id} value={route.id}>
            <AccordionTrigger>
              <div className="justify-center rdt-flex rdt-w-full rdt-items-center rdt-gap-2">
                <span className="rdt-text-gray-500">Route:</span> {route.route}{" "}
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
              <div className="rdt-flex rdt-gap-2">
                <span className="rdt-text-gray-500">Key:</span>
                {route.id}
              </div>
              <div className="rdt-mb-4 rdt-mt-4 rdt-flex rdt-flex-col rdt-gap-2">
                <span className="rdt-text-gray-500">Components contained in the route:</span>
                <div className="rdt-flex rdt-gap-2">
                  <Tag color={route.hasLoader ? "GREEN" : "RED"}>Loader</Tag>
                  <Tag color={route.hasAction ? "GREEN" : "RED"}>Action</Tag>
                  <Tag color={route.hasErrorBoundary ? "GREEN" : "RED"}>ErrorBoundary</Tag>
                </div>
              </div>
              {hasWildcard && (
                <>
                  <p className="rdt-mb-2 rdt-text-gray-500">Wildcard parameters:</p>
                  <div className="rdt-mb-4 rdt-grid rdt-w-full rdt-grid-cols-2 rdt-gap-2">
                    {route.route
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
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export { RoutesTab };
