import { EntryRoute } from "@remix-run/react/dist/routes";

type RouteType = "ROOT" | "LAYOUT" | "ROUTE";

export function getRouteType(route: EntryRoute) {
  let routeType: RouteType = "ROUTE";

  if (route.id === "root") {
    routeType = "ROOT";
  } else if (route.index) {
    routeType = "ROUTE";
  } else if (!route.path) {
    // Pathless layout route
    routeType = "LAYOUT";
  } else {
    // Find an other route with parentId set to this route
    const childRoute = Object.values(window.__remixManifest.routes).find(
      (r) => r.parentId === route.id
    );

    // If this is an index route, current route is only layout route
    routeType = childRoute?.index ? "LAYOUT" : "ROUTE";
  }

  return routeType;
}

export function isLayoutRoute(route: EntryRoute) {
  return getRouteType(route) === "LAYOUT";
}

export function isLeafRoute(route: EntryRoute) {
  return getRouteType(route) === "ROUTE";
}
