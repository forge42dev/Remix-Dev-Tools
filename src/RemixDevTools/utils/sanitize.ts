import { EntryRoute, RouteManifest } from "@remix-run/react/dist/routes";

type Route = Pick<EntryRoute, "path" | "parentId" | "id">;
/**
 * Helper method used to convert remix route conventions to url segments
 * @param chunk Chunk to convert
 * @returns Returns the converted chunk
 */
export const convertRemixPathToUrl = (routes: RouteManifest<Route>, route: Route) => {
  let currentRoute: Route | null = route;
  const path = [];

  while (currentRoute) {
    path.push(currentRoute.path);
    if (!currentRoute.parentId) break;
    if (!routes[currentRoute.parentId]) break;
    currentRoute = routes[currentRoute.parentId];
  }
  const output = path.reverse().filter(Boolean).join("/");
  return output === "" ? "/" : output;
};

export const tryParseJson = (json: string | null) => {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

interface RawNodeDatum {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
}

export const createRouteTree = (routes: RouteManifest<Route>) => {
  const routeTree: Record<string, RawNodeDatum> = {};
  const unsortedRoutes = [];
  Object.keys(routes).forEach((key) => {
    const route = routes[key];
    if (!route.parentId) {
      routeTree[route.id] = {
        name: route.id,
        attributes: {
          id: route.id,
          parentId: route.parentId ?? "",
          path: route.path ?? "",
        },
        children: [],
      };
      return;
    }
    if (!routeTree[route.parentId]) {
      unsortedRoutes.push(route);
      return;
    }
    const node = {
      name: route.id,
      attributes: {
        id: route.id,
        parentId: route.parentId ?? "",
        path: route.path ?? "",
      },
      children: [],
    };
    routeTree[route.parentId] = {
      ...routeTree[route.parentId],
      children: routeTree[route.parentId].children ? [...routeTree[route.parentId].children!, node] : [node],
    };
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Object.entries(routeTree).reduce((acc, [key, value]) => {
    acc.push(value);
    return acc;
  }, [] as RawNodeDatum[]);
};
