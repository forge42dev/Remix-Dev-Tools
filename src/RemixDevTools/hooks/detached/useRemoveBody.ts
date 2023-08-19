import { useEffect } from "react";
import { RemixDevToolsState } from "../../context/rdtReducer";
import { REMIX_DEV_TOOLS } from "../../utils/storage";

export const useRemoveBody = (state: RemixDevToolsState) => {
  useEffect(() => {
    if (!state.detachedWindow) {
      return;
    }

    const elements = document.body.children;
    document.body.classList.add("rdt-bg-[#212121]");
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.id !== REMIX_DEV_TOOLS) {
        element.classList.add("rdt-hidden");
      }
    }
  }, [state]);
};
