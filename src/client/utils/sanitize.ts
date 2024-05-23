import { UNSAFE_EntryRoute, UNSAFE_RouteManifest } from "react-router";

type Route = Pick<UNSAFE_EntryRoute, "path" | "parentId" | "id" | "hasErrorBoundary">;
/**
 * Helper method used to convert remix route conventions to url segments
 * @param chunk Chunk to convert
 * @returns Returns the converted chunk
 */
export const convertRemixPathToUrl = (routes: UNSAFE_RouteManifest<Route>, route: Route) => {
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

export const findParentErrorBoundary = (routes: UNSAFE_RouteManifest<Route>, route: Route) => {
  let currentRoute: Route | null = route;

  while (currentRoute) {
    const hasErrorBoundary = currentRoute.hasErrorBoundary;
    if (hasErrorBoundary) return { hasErrorBoundary, errorBoundaryId: currentRoute.id };

    if (!currentRoute.parentId) break;
    if (!routes[currentRoute.parentId]) break;
    currentRoute = routes[currentRoute.parentId];
  }
  return { hasErrorBoundary: false, errorBoundaryId: null };
};

export const tryParseJson = <T extends unknown>(json: string | null): T | undefined => {
  if (!json) return undefined;
  try {
    return JSON.parse(json);
  } catch (e) {
    return undefined;
  }
};

interface RawNodeDatum {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
  errorBoundary: { hasErrorBoundary: boolean; errorBoundaryId: string | null };
}

const constructTree = (routes: Record<string, Route>, parentId?: string): RawNodeDatum[] => {
  const nodes: RawNodeDatum[] = [];
  Object.keys(routes).forEach((key) => {
    const route = routes[key];
    if (route.parentId === parentId) {
      const url = convertRemixPathToUrl(routes, route);
      const node: RawNodeDatum = {
        name: url,
        attributes: {
          ...route,
          url,
        },
        errorBoundary: findParentErrorBoundary(routes, route),
        children: constructTree(routes, route.id),
      };
      nodes.push(node);
    }
  });
  return nodes;
};

export const createRouteTree = (routes: UNSAFE_RouteManifest<Route>) => {
  return constructTree(routes);
};

export const uppercaseFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
