import { EntryRoute, RouteManifest } from "@remix-run/react/dist/routes";

/**
 * Helper method used to convert remix route conventions to url segments
 * @param chunk Chunk to convert
 * @returns Returns the converted chunk
 */
export const convertRemixPathToUrl = (
  routes: RouteManifest<EntryRoute>,
  route: EntryRoute
) => {
  let currentRoute = route;
  const path = [];

  while (currentRoute) {
    if (!currentRoute) break;
    path.push(currentRoute.path);
    currentRoute = routes[currentRoute.parentId as any];
  }
  const output = path.reverse().filter(Boolean).join("/");
  return output === "" ? "/" : output;
};
