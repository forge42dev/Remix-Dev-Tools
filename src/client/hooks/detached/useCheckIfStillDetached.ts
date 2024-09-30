import { useCallback, useContext, useEffect, useState } from "react"
import { RDTContext, getExistingStateFromStorage } from "../../context/RDTContext.js"
import {
	REMIX_DEV_TOOLS_CHECK_DETACHED,
	REMIX_DEV_TOOLS_DETACHED,
	REMIX_DEV_TOOLS_DETACHED_OWNER,
	REMIX_DEV_TOOLS_IS_DETACHED,
	getBooleanFromStorage,
	setStorageItem,
} from "../../utils/storage.js"

export const useCheckIfStillDetached = () => {
	const { dispatch } = useContext(RDTContext)
	const [checking, setChecking] = useState(false)
	const isDetached = getBooleanFromStorage(REMIX_DEV_TOOLS_IS_DETACHED)

	useEffect(() => {
		if (!checking || !isDetached) {
			return
		}

		// On reload the detached window will set the flag back to false so we can check if it is still detached
		const isNotDetachedAnymore = getBooleanFromStorage(REMIX_DEV_TOOLS_CHECK_DETACHED)
		// The window hasn't set it back to true so it is not detached anymore and we clean all the detached state
		if (isNotDetachedAnymore) {
			setStorageItem(REMIX_DEV_TOOLS_IS_DETACHED, "false")
			setStorageItem(REMIX_DEV_TOOLS_CHECK_DETACHED, "false")
			sessionStorage.removeItem(REMIX_DEV_TOOLS_DETACHED_OWNER)
			sessionStorage.removeItem(REMIX_DEV_TOOLS_DETACHED)
			const state = getExistingStateFromStorage()
			dispatch({ type: "SET_WHOLE_STATE", payload: state })
			setChecking(false)
		}
	}, [checking, dispatch, isDetached])

	const checkDetachment = useCallback(
		(e: any) => {
			// We only care about the should_check key
			if (e.key !== REMIX_DEV_TOOLS_CHECK_DETACHED) {
				return
			}

			const shouldCheckDetached = getBooleanFromStorage(REMIX_DEV_TOOLS_CHECK_DETACHED)

			// If the detached window is unloaded we want to check if it is still there
			if (shouldCheckDetached && !checking) {
				setTimeout(() => setChecking(true), 200)
			}
		},
		[checking]
	)
	useEffect(() => {
		if (checking || !isDetached) {
			return
		}

		addEventListener("storage", checkDetachment)
		return () => removeEventListener("storage", checkDetachment)
	}, [checking, isDetached, checkDetachment])
}
