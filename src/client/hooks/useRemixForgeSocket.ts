export const useRemixForgeSocket = (options?: any) => {
	return { sendJsonMessage: (obj: any) => {}, isConnected: false, isConnecting: false }
}

interface RemixForgeMessage extends Record<string, unknown> {
	subtype: "read_file" | "open_file" | "delete_file" | "write_file"
	path: string
	data?: string
}

export const useRemixForgeSocketExternal = (options?: any) => {
	const { sendJsonMessage, ...rest } = useRemixForgeSocket(options)
	const sendJsonMessageExternal = (message: RemixForgeMessage) => {
		sendJsonMessage({ ...message, type: "plugin" })
	}
	return { sendJsonMessage: sendJsonMessageExternal, ...rest }
}
