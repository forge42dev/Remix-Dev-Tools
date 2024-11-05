import type { ClientActionFunctionArgs, ClientLoaderFunctionArgs } from "react-router"

export const withClientLoaderWrapper = (loader: (args: ClientLoaderFunctionArgs) => any, routeId: string) => {
	return async (args: ClientLoaderFunctionArgs) => {
		const startTime = Date.now()
		const headers = Object.fromEntries(args.request.headers.entries())
		import.meta.hot?.send("request-event", {
			type: "client-loader",
			url: args.request.url,
			headers,
			startTime,
			id: routeId,
			method: args.request.method,
		})

		const data = await loader(args)
		import.meta.hot?.send("request-event", {
			type: "client-loader",
			url: args.request.url,
			headers,
			startTime,
			endTime: Date.now(),
			id: routeId,
			data,
			method: args.request.method,
		})

		return data
	}
}

export const withClientActionWrapper = (action: (args: ClientActionFunctionArgs) => any, routeId: string) => {
	return async (args: ClientActionFunctionArgs) => {
		const startTime = Date.now()
		const headers = Object.fromEntries(args.request.headers.entries())
		import.meta.hot?.send("request-event", {
			type: "client-loader",
			url: args.request.url,
			headers,
			startTime,
			id: routeId,
			method: args.request.method,
		})

		const data = await action(args)
		import.meta.hot?.send("request-event", {
			type: "client-loader",
			url: args.request.url,
			headers,
			startTime,
			endTime: Date.now(),
			id: routeId,
			data,
			method: args.request.method,
		})

		return data
	}
}
