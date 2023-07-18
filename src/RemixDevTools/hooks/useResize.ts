import { useCallback, useEffect, useState } from "react";
import { useRDTContext } from "../context/useRDTContext";

const useResize = () => {
  const { height, setHeight } = useRDTContext();
  const [isResizing, setIsResizing] = useState(false);

  const enableResize = useCallback(() => {
    setIsResizing(true);
  }, [setIsResizing]);

  const disableResize = useCallback(() => {
    setIsResizing(false);
  }, [setIsResizing]);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newHeight = window.innerHeight - e.clientY; // Calculate the new height based on the mouse position

        //const newHeight = e.clientY; // You may want to add some offset here from props

        setHeight(newHeight);
      }
    },
    [isResizing, setHeight]
  );

  useEffect(() => {
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", disableResize);

    return () => {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", disableResize);
    };
  }, [disableResize, resize]);

  return { height, enableResize, disableResize, isResizing };
};

export { useResize };
