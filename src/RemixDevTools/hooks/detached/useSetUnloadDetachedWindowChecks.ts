import { useDetachedWindowControls } from "../../context/useRDTContext";
import { REMIX_DEV_TOOLS_CHECK_DETACHED, setStorageItem } from "../../utils/storage";
import { useAttachListener } from "../useAttachListener";

export const useSetUnloadDetachedWindowChecks = () => {
  const { isDetached } = useDetachedWindowControls();
  useAttachListener("unload", "window", () => setStorageItem(REMIX_DEV_TOOLS_CHECK_DETACHED, "true"), isDetached);
};
