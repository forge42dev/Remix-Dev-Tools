import type { ActionFunctionArgs } from "react-router"
//import type { ServerRoute } from "react-router/dom"
import { asyncAnalysis, isAsyncFunction, syncAnalysis } from "./utils.js"
type ServerRoute = any
const asyncAction = (
	route: Omit<ServerRoute, "children">,
	action: (args: ActionFunctionArgs) => Promise<Response | unknown>
) => asyncAnalysis(route.id, "action", action)

const syncAction = (route: Omit<ServerRoute, "children">, action: (args: ActionFunctionArgs) => Response | unknown) =>
	syncAnalysis(route.id, "action", action)

export const augmentAction = (
	route: Omit<ServerRoute, "children">,
	action: (args: ActionFunctionArgs) => Response | unknown | Promise<Response | unknown>
) => {
	return isAsyncFunction(action)
		? asyncAction(route, action as (args: ActionFunctionArgs) => Promise<Response | unknown>)
		: syncAction(route, action)
}
