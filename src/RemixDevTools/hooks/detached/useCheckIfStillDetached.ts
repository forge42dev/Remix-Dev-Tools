import { useContext } from "react";
import { RDTContext, getExistingStateFromStorage } from "../../context/RDTContext";
import {
  REMIX_DEV_TOOLS_CHECK_DETACHED,
  REMIX_DEV_TOOLS_IS_DETACHED,
  getBooleanFromStorage,
  setStorageItem,
} from "../../utils/storage";
import { useAttachListener } from "../useAttachListener";

export const useCheckIfStillDetached = () => {
  const { dispatch } = useContext(RDTContext);
  // Used to detect if the detached window has been closed
  useAttachListener("storage", "window", (e: any) => {
    // We only care about the should_check key
    if (e.key !== REMIX_DEV_TOOLS_CHECK_DETACHED) {
      return;
    }

    const shouldCheckDetached = getBooleanFromStorage(REMIX_DEV_TOOLS_CHECK_DETACHED);
    // If the detached window is unloaded we want to check if it is still there
    if (shouldCheckDetached) {
      // We want to give the detached window some time to reload
      setTimeout(() => {
        // On reload the detached window will set the flag back to false so we can check if it is still detached
        const isNotDetachedAnymore = getBooleanFromStorage(REMIX_DEV_TOOLS_CHECK_DETACHED);
        // The window hasn't set it back to true so it is not detached anymore and we clean all the detached state
        if (isNotDetachedAnymore) {
          setStorageItem(REMIX_DEV_TOOLS_IS_DETACHED, "false");
          setStorageItem(REMIX_DEV_TOOLS_CHECK_DETACHED, "false");
        }
        const state = getExistingStateFromStorage();
        dispatch({ type: "SET_WHOLE_STATE", payload: state });
      }, 50);
    }
  });
};
