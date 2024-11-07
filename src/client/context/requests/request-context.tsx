import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { NetworkRequest } from "../../components/network-tracer/types"

export const RequestContext = createContext<{
	requests: NetworkRequest[]
	removeAllRequests: () => void
}>({ requests: [], removeAllRequests: () => {} })

const requestMap = new Map<string, NetworkRequest>()

export const RequestProvider = ({ children }: any) => {
	const [requests, setRequests] = useState<NetworkRequest[]>([])
	const setNewRequests = useCallback((payload: string) => {
		const requests = JSON.parse(payload)
		const newRequests = Array.isArray(requests) ? requests : [requests]
		for (const req of newRequests) {
			requestMap.set(req.id + req.startTime, req)
			import.meta.hot?.send("remove-event", { ...req, fromClient: true })
		}
		setRequests(Array.from(requestMap.values()))
	}, [])
	useEffect(() => {
		import.meta.hot?.send("get-events")
		import.meta.hot?.on("get-events", setNewRequests)
		import.meta.hot?.on("request-event", setNewRequests)
		return () => {
			import.meta.hot?.off("get-events", setNewRequests)
			import.meta.hot?.off("request-event", setNewRequests)
		}
	}, [setNewRequests])

	const removeAllRequests = useCallback(() => {
		setRequests([])
		requestMap.clear()
	}, [])
	return <RequestContext.Provider value={{ requests, removeAllRequests }}>{children}</RequestContext.Provider>
}

export const useRequestContext = () => {
	return useContext(RequestContext)
}