import {
	REMIX_DEV_TOOLS_DETACHED,
	REMIX_DEV_TOOLS_DETACHED_OWNER,
	REMIX_DEV_TOOLS_IS_DETACHED,
	getBooleanFromSession,
	getBooleanFromStorage,
} from "./storage.js"

export const checkIsDetachedWindow = () => getBooleanFromSession(REMIX_DEV_TOOLS_DETACHED)
export const checkIsDetached = () => getBooleanFromStorage(REMIX_DEV_TOOLS_IS_DETACHED)
export const checkIsDetachedOwner = () => getBooleanFromSession(REMIX_DEV_TOOLS_DETACHED_OWNER)
