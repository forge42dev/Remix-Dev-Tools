import chalk from "chalk"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { type DevToolsServerConfig, getConfig } from "./config.js"
import { actionLog, errorLog, infoLog, loaderLog, redirectLog } from "./logger.js"
import { diffInMs, secondsToHuman } from "./perf.js"

type ServerRoute = any
const analyzeCookies = (routeId: string, config: DevToolsServerConfig, headers: Headers) => {
	if (config.logs?.cookies === false) {
		return
	}
	if (headers.get("Set-Cookie")) {
		infoLog(`🍪 Cookie set by ${chalk.blueBright(routeId)}`)
	}
}

const analyzeCache = (routeId: string, config: DevToolsServerConfig, headers: Headers) => {
	if (config.logs?.cache === false) {
		return
	}
	if (headers.get("Cache-Control")) {
		const cacheDuration = headers
			.get("Cache-Control")
			?.split(" ")
			.map((x) => x.trim().replace(",", ""))

		const age = cacheDuration?.find((x) => x.includes("max-age"))
		const serverAge = cacheDuration?.find((x) => x.includes("s-maxage"))
		const isPrivate = cacheDuration?.find((x) => x.includes("private"))
		if (age && serverAge && !isPrivate) {
			const duration = serverAge.split("=")[1]
			const durationNumber = Number.isNaN(Number.parseInt(duration)) ? 0 : Number.parseInt(duration)
			return infoLog(
				`📦 Route ${chalk.blueBright(routeId)} cached for ${chalk.green(secondsToHuman(durationNumber))} ${chalk.green(
					"[Shared Cache]"
				)}`
			)
		}
		if (age) {
			const duration = age.split("=")[1]
			const durationNumber = Number.isNaN(Number.parseInt(duration)) ? 0 : Number.parseInt(duration)

			infoLog(
				`📦 Route ${chalk.blueBright(routeId)} cached for ${chalk.green(secondsToHuman(durationNumber))} ${chalk.green(
					`[${isPrivate ? "Private Cache" : "Shared Cache"}]`
				)}`
			)
		}
		if (serverAge) {
			const duration = serverAge.split("=")[1]
			const durationNumber = Number.isNaN(Number.parseInt(duration)) ? 0 : Number.parseInt(duration)
			infoLog(
				`📦 Route ${chalk.blueBright(routeId)} cached for ${chalk.green(secondsToHuman(durationNumber))} ${chalk.green(
					"[Shared Cache]"
				)}`
			)
		}
	}
}

const analyzeClearSite = (routeId: string, config: DevToolsServerConfig, headers: Headers) => {
	if (config.logs?.siteClear === false) {
		return
	}

	if (headers.get("Clear-Site-Data")) {
		const data = headers.get("Clear-Site-Data")
		infoLog(`🧹 Site data cleared by ${chalk.blueBright(routeId)} ${chalk.green(`[${data}]`)}`)
	}
}
const analyzeServerTimings = (routeId: string, config: DevToolsServerConfig, headers: Headers) => {
	if (config.logs?.serverTimings === false) {
		return
	}
	const data = headers.get("Server-Timing")

	if (data) {
		const splitEntries = data.split(",")
		for (const entry of splitEntries) {
			const segments = entry.split(";")
			let name: string | null = null
			let desc: string | null = null
			let dur: number | null = null

			for (const segment of segments) {
				const [key, value] = segment.split("=")
				if (key === "desc") {
					desc = value
				} else if (key === "dur") {
					dur = Number(value)
				} else {
					name = segment
				}
			}
			if (!name || dur === null) {
				return
			}
			const threshold = config.serverTimingThreshold ?? Number.POSITIVE_INFINITY
			const overThreshold = dur > threshold
			const durationColor = overThreshold ? chalk.redBright : chalk.green
			infoLog(
				`⏰  Server timing for route ${chalk.blueBright(routeId)} - ${chalk.cyanBright(name)} ${durationColor(`[${dur}ms]`)} ${desc ? chalk.yellow(`[${desc}]`) : ""}`
			)
		}
	}
}

const analyzeHeaders = (routeId: string, response: unknown) => {
	if (!(response instanceof Response)) {
		return
	}
	const headers = new Headers(response.headers)
	const config = getConfig()
	analyzeCookies(routeId, config, headers)
	analyzeCache(routeId, config, headers)
	analyzeClearSite(routeId, config, headers)
	analyzeServerTimings(routeId, config, headers)
}

const analyzeDeferred = (id: string, start: number, response: any) => {
	const config = getConfig()
	if (config.logs?.defer === false) {
		return
	}
	if (response?.deferredKeys) {
		infoLog(`Deferred values detected in ${chalk.blueBright(id)} - ${chalk.white(response.deferredKeys.join(", "))}`)
		response.deferredKeys.map((key: string) => {
			response.data[key]
				.then(() => {
					const end = diffInMs(start)
					infoLog(`Deferred value ${chalk.white(key)} resolved in ${chalk.blueBright(id)} - ${chalk.white(`${end}ms`)}`)
				})
				.catch((e: any) => {
					errorLog(`Deferred value ${chalk.white(key)} rejected in ${chalk.blueBright(id)}`)
					errorLog(e?.message ? e.message : e)
				})
		})
	}
}

export const isAsyncFunction = (fn: (...args: any[]) => any) => {
	return fn.constructor.name === "AsyncFunction"
}

const unAwaited = async (promise: () => any) => {
	promise()
}

const errorHandler = (routeId: string, e: any, shouldThrow = false) => {
	unAwaited(() => {
		if (e instanceof Response) {
			const headers = new Headers(e.headers)
			const location = headers.get("Location")
			if (location) {
				redirectLog(`${chalk.blueBright(routeId)} threw a response!`)
				redirectLog(`${chalk.blueBright(routeId)} redirected to ${chalk.green(location)}`)
			} else {
				errorLog(`${chalk.blueBright(routeId)} threw a response!`)
				if (e.status) {
					errorLog(`${chalk.blueBright(routeId)} responded with ${chalk.white(e.status)}`)
				}
			}
		} else {
			errorLog(`${chalk.blueBright(routeId)} threw an error!`)
			errorLog(`${e?.message}`)
		}
	})
	if (shouldThrow) {
		throw e
	}
}
const logTrigger = (id: string, type: "action" | "loader", end: number) => {
	if (type === "action") {
		actionLog(`${chalk.blueBright(id)} triggered - ${chalk.white(`${end} ms`)}`)
	} else {
		loaderLog(`${chalk.blueBright(id)} triggered - ${chalk.white(`${end} ms`)}`)
	}
}

const extractHeadersFromResponseOrRequest = (response: Response | Request) => {
	const headers = new Headers(response.headers)
	return Object.fromEntries(headers.entries())
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const extractDataFromResponseOrRequest = async (response: Response | Request): Promise<null | unknown> => {
	try {
		const extractable = new Response(response.body, response)
		const headers = new Headers(extractable.headers)
		const contentType = headers.get("Content-Type")
		if (contentType?.includes("application/json")) {
			return extractable.json()
		}
		if (contentType?.includes("text/html")) {
			return extractable.text()
		}
		if (contentType?.includes("x-www-form-urlencoded")) {
			const formData = await extractable.formData()
			return Object.fromEntries(formData.entries())
		}
	} catch (e) {
		return null
	}
	return null
}

const storeAndEmitActionOrLoaderInfo = async (
	type: "action" | "loader",
	routeId: string,
	response: unknown,
	end: number,
	args: LoaderFunctionArgs | ActionFunctionArgs
) => {
	const isResponse = response instanceof Response
	const isObject = typeof response === "object" && response !== null && !("deferredKeys" in response)
	const responseHeaders = isResponse ? extractHeadersFromResponseOrRequest(response) : null
	const requestHeaders = extractHeadersFromResponseOrRequest(args.request)
	// create the event
	const event = {
		type,
		data: {
			id: routeId,
			executionTime: end,
			timestamp: new Date().getTime(),
			...(isObject ? { responseData: response } : {}),
			//requestData: await extractDataFromResponseOrRequest(args.request),
			requestHeaders,
			responseHeaders,
		},
	}
	const port = process.rdt_port

	if (port) {
		fetch(`http://localhost:${port}/react-router-devtools-request`, {
			method: "POST",
			body: JSON.stringify(event),
		})
			.then(() => {})
			.catch(() => {})
	}
}

export type RequestEvent = {
	routine?: "request-event"
	type: "action" | "loader"
	headers: Record<string, string>
	id: string
	startTime: number
	endTime?: number | undefined
	data?: any | undefined
	method: string
	status?: string
	url: string
	aborted?: boolean
}

const sendEvent = (event: RequestEvent) => {
	const port = process.rdt_port

	if (port) {
		fetch(`http://localhost:${port}/react-router-devtools-request`, {
			method: "POST",
			body: JSON.stringify({ routine: "request-event", ...event }),
		})
			.then(() => {})
			.catch(() => {})
	}
}

export const syncAnalysis =
	(routeId: string, type: "action" | "loader", loaderOrAction: (args: any) => any) =>
	(args: LoaderFunctionArgs | ActionFunctionArgs) => {
		const start = performance.now()
		const startTime = Date.now()
		const headers = Object.fromEntries(args.request.headers.entries())
		sendEvent({
			type,
			headers,
			startTime,
			method: args.request.method,
			id: routeId,
			url: args.request.url,
		})

		try {
			const response = loaderOrAction(args)
			unAwaited(() => {
				const end = diffInMs(start)
				logTrigger(routeId, type, end)
				storeAndEmitActionOrLoaderInfo(type, routeId, response, end, args)
				analyzeHeaders(routeId, response)
			})
			const endTime = Date.now()
			sendEvent({
				type,
				headers,
				startTime,
				endTime,
				data: response,
				id: routeId,
				url: args.request.url,
				method: args.request.method,
				status: typeof response === "object" ? (response as any).status : undefined,
			})
			return response
		} catch (err: any) {
			errorHandler(routeId, err, true)
		}
	}

export const asyncAnalysis =
	(routeId: string, type: "action" | "loader", loaderOrAction: (args: any) => Promise<any>) =>
	async (args: LoaderFunctionArgs | ActionFunctionArgs) => {
		const start = performance.now()
		const response = loaderOrAction(args)
		const headers = Object.fromEntries(args.request.headers.entries())
		const startTime = Date.now()
		sendEvent({
			type,
			headers,
			startTime,
			method: args.request.method,
			url: args.request.url,
			id: routeId,
		})
		let aborted = false
		args.request.signal.addEventListener("abort", () => {
			aborted = true
			sendEvent({
				type,
				url: args.request.url,
				headers,
				startTime,
				endTime: Date.now(),
				id: routeId,
				method: args.request.method,
				aborted: true,
			})
		})
		const res = await response
		unAwaited(() => {
			const end = diffInMs(start)
			const endTime = Date.now()
			storeAndEmitActionOrLoaderInfo(type, routeId, response, end, args)
			logTrigger(routeId, type, end)
			analyzeDeferred(routeId, start, response)
			analyzeHeaders(routeId, response)
			if (!aborted) {
				sendEvent({
					type,
					headers,
					startTime,
					endTime,
					data: res,
					id: routeId,
					url: args.request.url,
					method: args.request.method,
					status: typeof response === "object" ? (response as any).status : undefined,
				})
			}
		})
		return res
	}
