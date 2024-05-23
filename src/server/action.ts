import { ActionFunctionArgs } from "@react-router/server-runtime";
import { ServerRoute } from "@react-router/server-runtime/dist/routes.js";
import { asyncAnalysis, isAsyncFunction, syncAnalysis } from "./utils.js";

const asyncAction = (
  route: Omit<ServerRoute, "children">,
  action: (args: ActionFunctionArgs) => Promise<Response | unknown>
) => asyncAnalysis(route, "action", action);

const syncAction = (route: Omit<ServerRoute, "children">, action: (args: ActionFunctionArgs) => Response | unknown) =>
  syncAnalysis(route, "action", action);

export const augmentAction = (
  route: Omit<ServerRoute, "children">,
  action: (args: ActionFunctionArgs) => Response | unknown | Promise<Response | unknown>
) => {
  return isAsyncFunction(action)
    ? asyncAction(route, action as (args: ActionFunctionArgs) => Promise<Response | unknown>)
    : syncAction(route, action);
};
