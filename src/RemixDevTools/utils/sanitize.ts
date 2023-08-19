import { EntryRoute, RouteManifest } from "@remix-run/react/dist/routes";

type Route = Pick<EntryRoute, "path" | "parentId">;
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
