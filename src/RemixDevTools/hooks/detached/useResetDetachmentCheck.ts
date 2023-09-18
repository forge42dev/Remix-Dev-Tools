import { useDetachedWindowControls } from '../../context/useRDTContext.js';
import { REMIX_DEV_TOOLS_CHECK_DETACHED, setStorageItem } from '../../utils/storage.js';
import { useAttachListener } from '../useAttachListener.js';
import { useCheckIfStillDetached } from './useCheckIfStillDetached.js';

export const useResetDetachmentCheck = () => {
  const { isDetached } = useDetachedWindowControls();
  useCheckIfStillDetached();
  useAttachListener("unload", "window", () => setStorageItem(REMIX_DEV_TOOLS_CHECK_DETACHED, "true"), isDetached);
};
