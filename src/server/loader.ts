import type { LoaderFunctionArgs } from "@remix-run/server-runtime"
import type { ServerRoute, ServerRouteManifest } from "@remix-run/server-runtime/dist/routes.js"
import { augmentAction } from "./action.js"
import { asyncAnalysis, isAsyncFunction, syncAnalysis } from "./utils.js"

const asyncLoader = (
	route: Omit<ServerRoute, "children">,
	loader: (args: LoaderFunctionArgs) => Promise<Response | unknown>
) => asyncAnalysis(route, "loader", loader)
const syncLoader = (route: Omit<ServerRoute, "children">, loader: (args: LoaderFunctionArgs) => Response | unknown) =>
	syncAnalysis(route, "loader", loader)

const augmentLoader = (
	route: Omit<ServerRoute, "children">,
	loader: (args: LoaderFunctionArgs) => Response | unknown | Promise<Response | unknown>
) => {
	return isAsyncFunction(loader)
		? asyncLoader(route, loader as (args: LoaderFunctionArgs) => Promise<Response | unknown>)
		: syncLoader(route, loader)
}

export const augmentLoadersAndActions = <T extends ServerRouteManifest>(routes: T) => {
	return Object.entries(routes).reduce((acc, [name, route]) => {
		return {
			// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
			...acc,
			[name]: {
				...route,
				module: {
					...route.module,
					...(route.module.loader ? { loader: augmentLoader(route, route.module.loader as any) } : {}),
					...(route.module.action ? { action: augmentAction(route, route.module.action as any) } : {}),
				},
			},
		}
	}, {})
}
