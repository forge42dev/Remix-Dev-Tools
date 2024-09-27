export const getStorageItem = (key: string) => localStorage.getItem(key)
export const setStorageItem = (key: string, value: string) => {
	try {
		localStorage.setItem(key, value)
	} catch (e) {
		return
	}
}
export const getSessionItem = (key: string) => sessionStorage.getItem(key)
export const setSessionItem = (key: string, value: string) => {
	try {
		sessionStorage.setItem(key, value)
	} catch (e) {
		return
	}
}

export const getBooleanFromStorage = (key: string) => getStorageItem(key) === "true"
export const getBooleanFromSession = (key: string) => getSessionItem(key) === "true"

export const REMIX_DEV_TOOLS = "remixDevTools"
export const REMIX_DEV_TOOLS_STATE = "remixDevTools_state"
export const REMIX_DEV_TOOLS_SETTINGS = "remixDevTools_settings"
export const REMIX_DEV_TOOLS_DETACHED = "remixDevTools_detached"
export const REMIX_DEV_TOOLS_DETACHED_OWNER = "remixDevTools_detached_owner"
export const REMIX_DEV_TOOLS_IS_DETACHED = "remixDevTools_is_detached"
export const REMIX_DEV_TOOLS_CHECK_DETACHED = "remixDevTools_check_detached"
