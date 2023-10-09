import { useCallback, useEffect } from "react";
import { useNavigation } from "@remix-run/react";

export const ROUTE_CLASS = "rdt-outlet-route";

const isSourceElement = (fiberNode: any) => {
  return (
    fiberNode?.elementType &&
    fiberNode?.stateNode &&
    fiberNode?._debugSource &&
    !fiberNode?.stateNode?.getAttribute?.("data-rdt-source")
  );
};

const isJsxFile = (fiberNode: any) =>
  fiberNode?._debugSource?.fileName?.includes("tsx") || fiberNode?._debugSource?.fileName?.includes("jsx");

export function useBorderedRoutes() {
  const navigation = useNavigation();
  const traverseComponentTree = useCallback((fiberNode: any, callback: any) => {
    callback(fiberNode);

    let child = fiberNode?.child;
    while (child) {
      traverseComponentTree(child, callback);
      child = child?.sibling;
    }
  }, []);

  const styleNearestElement = useCallback((fiberNode: any) => {
    if (!fiberNode) return;

    if (fiberNode.stateNode) {
      return fiberNode.stateNode?.classList?.add(ROUTE_CLASS);
    }
    styleNearestElement(fiberNode?.child);
  }, []);

  useEffect(() => {
    if (navigation.state !== "idle") return;
    const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!devTools) {
      return;
    }
    for (const [rendererID] of devTools.renderers) {
      const fiberRoots = devTools.getFiberRoots(rendererID);
      for (const rootFiber of fiberRoots) {
        traverseComponentTree(rootFiber.current, (fiberNode: any) => {
          if (isSourceElement(fiberNode)) {
            const isJsx = isJsxFile(fiberNode);

            const originalSource = fiberNode?._debugSource;
            const source = fiberNode?._debugOwner?._debugSource ?? fiberNode?._debugSource;
            const line = source?.fileName?.startsWith("/") ? originalSource?.lineNumber : source?.lineNumber;
            const fileName = source?.fileName?.startsWith("/") ? originalSource?.fileName : source?.fileName;
            fiberNode.stateNode?.setAttribute?.(
              "data-rdt-source",
              `${fileName}:${isJsx ? line - 20 : line}` //
            );
          }
          if (fiberNode?.elementType?.name === "default" || fiberNode?.elementType?.name === "RenderedRoute") {
            styleNearestElement(fiberNode);
          }
        });
      }
    }
  }, [navigation.state, styleNearestElement, traverseComponentTree]);
}
