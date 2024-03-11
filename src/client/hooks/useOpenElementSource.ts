import { useEffect } from "react";
import { useAttachDocumentListener } from "./useAttachListener.js";
import { useDevServerConnection } from "./useDevServerConnection.js";

const useOpenElementSource = () => {
  const { sendJsonMessage } = useDevServerConnection();
  useEffect(() => {
    const handleFocus = (e: any) => {
      e.stopPropagation();
      if (!e.altKey || !e.target?.getAttribute?.("data-rdt-source")) {
        return;
      }

      e.target?.classList?.add("rdt-cursor-pointer");
    };

    const handleBlur = (e: any) => e.target?.classList?.remove("rdt-cursor-pointer");

    document.addEventListener("mouseenter", handleFocus, true);
    document.addEventListener("mouseleave", handleBlur, true);

    return () => {
      document.removeEventListener("mouseenter", handleFocus, true);
      document.removeEventListener("mouseleave", handleBlur, true);
    };
  }, []);

  useAttachDocumentListener("contextmenu", (e: any) => {
 
    if (!e.shiftKey || !e) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    const target = e.target as HTMLElement;
    const rdtSource = target?.getAttribute("data-rdt-source");

    if (rdtSource) {
      const [source, line, column] = rdtSource.split(":::"); 
      return sendJsonMessage({
        type: "open-source",
        data: { source, line, column },
      });
    }
    for (const key in e.target) {
      if (key.startsWith("__reactFiber")) {
        const fiberNode = (e.target as any)[key];
       
        const originalSource = fiberNode?._debugSource;
        const source = fiberNode?._debugOwner?._debugSource ?? fiberNode?._debugSource;
        const line = source?.fileName?.startsWith("/") ? originalSource?.lineNumber : source?.lineNumber;
        const fileName = source?.fileName?.startsWith("/") ? originalSource?.fileName : source?.fileName;
        return sendJsonMessage({
          type: "open-source",
          data: { source: fileName, line, column: 0 },
        });
      }
    } 
  });
};

export { useOpenElementSource };
