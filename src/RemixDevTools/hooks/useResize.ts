import { useCallback, useEffect, useState } from "react";

type UseResizeProps = {
  minHeight: number;
};

const useResize = (
  { minHeight = 384 }: UseResizeProps = { minHeight: 384 }
) => {
  const [isResizing, setIsResizing] = useState(false);
  const [height, setHeight] = useState(minHeight);

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
        if (newHeight >= minHeight) {
          setHeight(newHeight);
        }
      }
    },
    [minHeight, isResizing, setHeight]
  );

  useEffect(() => {
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", disableResize);

    return () => {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", disableResize);
    };
  }, [disableResize, resize]);

  return { height, enableResize };
};

export { useResize };
