import { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { ServerRoute } from "@remix-run/server-runtime/dist/routes.js";
import { asyncAnalysis, isAsyncFunction, syncAnalysis } from "./utils.js";

const asyncLoader = (
  route: Omit<ServerRoute, "children">,
  loader: (args: LoaderFunctionArgs) => Promise<Response | unknown>
) => asyncAnalysis(route, "loader", loader);
const syncLoader = (route: Omit<ServerRoute, "children">, loader: (args: LoaderFunctionArgs) => Response | {}) =>
  syncAnalysis(route, "loader", loader);

export const augmentLoader = (
  route: Omit<ServerRoute, "children">,
  loader: (args: LoaderFunctionArgs) => Response | {} | Promise<Response | unknown>
) => {
  return isAsyncFunction(loader)
    ? asyncLoader(route, loader as (args: LoaderFunctionArgs) => Promise<Response | unknown>)
    : syncLoader(route, loader);
};
