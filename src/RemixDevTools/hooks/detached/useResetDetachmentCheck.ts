import { useDetachedWindowControls } from "../../context/useRDTContext";
import { REMIX_DEV_TOOLS_CHECK_DETACHED, setStorageItem } from "../../utils/storage";
import { useAttachListener } from "../useAttachListener";
import { useCheckIfStillDetached } from "./useCheckIfStillDetached";

export const useResetDetachmentCheck = () => {
  const { isDetached } = useDetachedWindowControls();
  useCheckIfStillDetached();
  useAttachListener("unload", "window", () => setStorageItem(REMIX_DEV_TOOLS_CHECK_DETACHED, "true"), isDetached);
};
