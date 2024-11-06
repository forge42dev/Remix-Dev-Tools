export interface NetworkRequest {
	id: string
	url: string
	method: string
	status: number
	startTime: number
	endTime: number | null
	size: number
	type: "loader" | "action" | "client-loader" | "client-action"
	data?: Record<string, unknown>
	headers?: Record<string, string>
	state: "pending" | "complete" | "error"
	aborted?: boolean
}
export interface Position {
	x: number
	y: number
}
