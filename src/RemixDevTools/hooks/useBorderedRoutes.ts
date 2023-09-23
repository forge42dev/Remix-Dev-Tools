import { useCallback, useEffect } from "react";
import { useNavigation } from "@remix-run/react";

export function useBorderedRoutes() {
  const navigation = useNavigation();
  const traverseComponentTree = useCallback((fiberNode: any, callback: any) => {
    callback(fiberNode);

    let child = fiberNode.child;
    while (child) {
      traverseComponentTree(child, callback);
      child = child.sibling;
    }
  }, []);

  const styleNearestElement = useCallback((fiberNode: any) => {
    if (!fiberNode) return;

    if (fiberNode.stateNode) {
      return fiberNode.stateNode.classList.add("rdt-border");
    }
    styleNearestElement(fiberNode.child);
  }, []);

  useEffect(() => {
    if (navigation.state !== "idle") return;
    const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

    for (const [rendererID] of devTools.renderers) {
      const fiberRoots = devTools.getFiberRoots(rendererID);
      for (const rootFiber of fiberRoots) {
        traverseComponentTree(rootFiber.current, (fiberNode: any) => {
          if (fiberNode?.elementType?.name === "default" || fiberNode?.elementType?.name === "RenderedRoute") {
            styleNearestElement(fiberNode);
          }
        });
      }
    }
  }, [navigation.state, styleNearestElement, traverseComponentTree]);
}
