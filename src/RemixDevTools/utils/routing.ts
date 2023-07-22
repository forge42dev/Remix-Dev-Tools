import { EntryRoute } from "@remix-run/react/dist/routes";

export type RouteType = "ROOT" | "LAYOUT" | "ROUTE";
type Route = Pick<EntryRoute, "id" | "index" | "path" | "parentId">;

export function getRouteType(route: Route) {
  if (route.id === "root") {
    return "ROOT";
  }
  if (route.index) {
    return "ROUTE";
  }
  if (!route.path) {
    // Pathless layout route
    return "LAYOUT";
  }

  // Find an index route with parentId set to this route
  const childIndexRoute = Object.values(window.__remixManifest.routes).find(
    (r) => r.parentId === route.id && r.index
  );

  return childIndexRoute ? "LAYOUT" : "ROUTE";
}

export function isLayoutRoute(route: Route) {
  return getRouteType(route) === "LAYOUT";
}

export function isLeafRoute(route: Route) {
  return getRouteType(route) === "ROUTE";
}
