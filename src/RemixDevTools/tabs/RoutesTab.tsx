import { useState } from "react";
import { EntryRoute } from "@remix-run/react/dist/routes";
import { convertRemixPathToUrl } from "../utils/sanitize";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/Accordion";
import { useNavigate } from "@remix-run/react";
import { Tag } from "../components/Tag";
import { useRDTContext } from "../context/useRDTContext";
import { Input } from "../components/Input";
import { NewRouteForm } from "../components/NewRouteForm";
import { useGetSocket } from "../hooks/useGetSocket";

interface RoutesTabProps {}

const isLayout = (route: EntryRoute & { route: string }) => {
  const rId = route.id.replace("routes/", "");
  const v2Layout =
    rId.startsWith("_") &&
    !rId.split(".")[0].endsWith("index") &&
    rId.split(".").length === 1;
  const v1Layout = rId.startsWith("__");
  return v1Layout || v2Layout;
};

const RoutesTab = ({}: RoutesTabProps) => {
  const { routeWildcards, setRouteWildcards } = useRDTContext();
  const { isConnected } = useGetSocket();
  const [routes] = useState<(EntryRoute & { route: string })[]>(
    Object.values(window.__remixManifest.routes)
      .map((route) => {
        return {
          ...route,
          route: convertRemixPathToUrl(window.__remixManifest.routes, route),
        };
      })
      .filter((route) => !isLayout(route) && route.id !== "root")
  );
  const navigate = useNavigate();

  return (
    <Accordion
      className="rdt-w-full rdt-h-[40vh] rdt-pr-4 rdt-pb-12 rdt-overflow-y-auto"
      type="single"
      collapsible
    >
      {isConnected && (
        <AccordionItem value="add-new">
          <AccordionTrigger>Add a new route to the project</AccordionTrigger>
          <AccordionContent>
            <NewRouteForm />
          </AccordionContent>
        </AccordionItem>
      )}
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
        const pathToOpen =
          document.location.origin + (path === "/" ? path : "/" + path);
        return (
          <AccordionItem key={route.id} value={route.id}>
            <AccordionTrigger>
              <div className="rdt-flex rdt-w-full rdt-items-center justify-center rdt-gap-2">
                <span className="rdt-text-gray-500">Route:</span> {route.route}{" "}
                <span className="rdt-text-gray-500 rdt-text-xs rdt-ml-auto">
                  Url: "{pathToOpen}"
                </span>
                <div
                  title={pathToOpen}
                  className="rdt-rounded rdt-border-gray-400 rdt-border rdt-px-2 rdt-py-1 rdt-text-sm rdt-mr-2"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(path);
                  }}
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
              <div className="rdt-flex rdt-flex-col rdt-gap-2 rdt-mt-4 rdt-mb-4">
                <span className="rdt-text-gray-500">
                  Components contained in the route:
                </span>
                <div className="rdt-flex rdt-gap-2">
                  <Tag color={route.hasLoader ? "GREEN" : "RED"}>Loader</Tag>
                  <Tag color={route.hasAction ? "GREEN" : "RED"}>Action</Tag>
                  <Tag color={route.hasErrorBoundary ? "GREEN" : "RED"}>
                    ErrorBoundary
                  </Tag>
                </div>
              </div>
              {hasWildcard && (
                <>
                  <p className="rdt-text-gray-500 rdt-mb-2">
                    Wildcard parameters:
                  </p>
                  <div className="rdt-grid rdt-w-full rdt-grid-cols-2 rdt-gap-2 rdt-mb-4">
                    {route.route
                      .split("/")
                      .filter((p) => p.startsWith(":"))
                      .map((param) => (
                        <div
                          key={param}
                          className="rdt-flex rdt-w-full rdt-gap-2"
                        >
                          <Tag key={param} color="BLUE">
                            {param}
                          </Tag>
                          <Input
                            value={routeWildcards[route.id]?.[param] || ""}
                            onChange={(e) =>
                              setRouteWildcards({
                                ...routeWildcards,
                                [route.id]: {
                                  ...routeWildcards[route.id],
                                  [param]: e.target.value,
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
