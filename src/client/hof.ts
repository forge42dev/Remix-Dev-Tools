import type { ClientActionFunctionArgs, ClientLoaderFunctionArgs, LinksFunction } from "react-router"

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
		let aborted = false
		args.request.signal.addEventListener("abort", () => {
			aborted = true
			import.meta.hot?.send("request-event", {
				type: "client-loader",
				url: args.request.url,
				headers,
				startTime,
				endTime: Date.now(),
				id: routeId,
				method: args.request.method,
				aborted: true,
			})
		})
		const data = await loader(args)
		if (!aborted) {
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
		}

		return data
	}
}

export const withLinksWrapper = (links: LinksFunction, rdtStylesheet: string): LinksFunction => {
	return () => [...links(), { rel: "stylesheet", href: rdtStylesheet }]
}

export const withClientActionWrapper = (action: (args: ClientActionFunctionArgs) => any, routeId: string) => {
	return async (args: ClientActionFunctionArgs) => {
		const startTime = Date.now()
		const headers = Object.fromEntries(args.request.headers.entries())
		import.meta.hot?.send("request-event", {
			type: "client-action",
			url: args.request.url,
			headers,
			startTime,
			id: routeId,
			method: args.request.method,
		})

		let aborted = false
		args.request.signal.addEventListener("abort", () => {
			aborted = true
			import.meta.hot?.send("request-event", {
				type: "client-action",
				url: args.request.url,
				headers,
				startTime,
				endTime: Date.now(),
				id: routeId,
				method: args.request.method,
			})
		})
		const data = await action(args)
		if (!aborted) {
			import.meta.hot?.send("request-event", {
				type: "client-action",
				url: args.request.url,
				headers,
				startTime,
				endTime: Date.now(),
				id: routeId,
				data,
				method: args.request.method,
			})
		}

		return data
	}
}
