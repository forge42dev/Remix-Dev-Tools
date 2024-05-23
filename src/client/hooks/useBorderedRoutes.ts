import { useCallback, useEffect, useRef } from "react";
import { useNavigation } from "react-router";
import { HTMLError } from "../context/rdtReducer.js";
import { useHtmlErrors } from "../context/useRDTContext.js";

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
  const invalidHtmlCollection = useRef<HTMLError[]>([]);
  const { setHtmlErrors } = useHtmlErrors();
  const addToInvalidCollection = (entry: HTMLError) => {
    if (invalidHtmlCollection.current.find((item) => JSON.stringify(item) === JSON.stringify(entry))) return;
    invalidHtmlCollection.current.push(entry);
  };

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

  const findIncorrectHtml = useCallback((fiberNode: any, originalFiberNode: any, originalTag: string) => {
    if (!fiberNode) return;

    const tag = fiberNode.elementType;
    const addInvalid = () => {
      const parentSource = originalFiberNode?._debugOwner?._debugSource ?? originalFiberNode?._debugSource;
      const source = fiberNode?._debugOwner?._debugSource ?? fiberNode?._debugSource;
      addToInvalidCollection({
        child: {
          file: parentSource?.fileName,
          tag: tag,
        },
        parent: {
          file: source?.fileName,
          tag: originalTag,
        },
      });
    };

    if (originalTag === "a") {
      const element = fiberNode.stateNode as HTMLElement;
      switch (tag) {
        case "a":
        case "button":
        case "details":
        case "embed":
        case "iframe":
        case "label":
        case "select":
        case "textarea": {
          addInvalid();
          break;
        }
        case "audio": {
          if (element.getAttribute("controls") !== null) {
            addInvalid();
          }
          break;
        }
        case "img": {
          if (element.getAttribute("usemap") !== null) {
            addInvalid();
          }
          break;
        }
        case "input": {
          if (element.getAttribute("type") !== "hidden") {
            addInvalid();
          }
          break;
        }
        case "object": {
          if (element.getAttribute("usemap") !== null) {
            addInvalid();
          }
          break;
        }
        case "video": {
          if (element.getAttribute("controls") !== null) {
            addInvalid();
          }
          break;
        }
        default: {
          break;
        }
      }
    }
    if (originalTag === "p") {
      switch (tag) {
        case "div":
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
        case "main":
        case "pre":
        case "p":
        case "section":
        case "table":
        case "ul":
        case "ol":
        case "li": {
          addInvalid();
          break;
        }
        default: {
          break;
        }
      }
    }
    if (originalTag === "form") {
      if (tag === "form") {
        addInvalid();
      }
    }
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(originalTag)) {
      if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
        addInvalid();
      }
    }
    findIncorrectHtml(fiberNode?.child, originalFiberNode, originalTag);
    if (fiberNode?.sibling) {
      findIncorrectHtml(fiberNode?.sibling, originalFiberNode, originalTag);
    }
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
          // Vite implementation
          if (isSourceElement(fiberNode) && typeof import.meta.hot !== "undefined") {
            const originalSource = fiberNode?._debugSource;
            const source = fiberNode?._debugOwner?._debugSource ?? fiberNode?._debugSource;
            const line = source?.fileName?.startsWith("/") ? originalSource?.lineNumber : source?.lineNumber;
            const fileName = source?.fileName?.startsWith("/") ? originalSource?.fileName : source?.fileName;

            fiberNode.stateNode?.setAttribute?.(
              "data-rdt-source",
              `${fileName}:::${line}` //
            );
          } else if (isSourceElement(fiberNode)) {
            const isJsx = isJsxFile(fiberNode);

            const originalSource = fiberNode?._debugSource;
            const source = fiberNode?._debugOwner?._debugSource ?? fiberNode?._debugSource;
            const line = source?.fileName?.startsWith("/") ? originalSource?.lineNumber : source?.lineNumber;
            const fileName = source?.fileName?.startsWith("/") ? originalSource?.fileName : source?.fileName;
            fiberNode.stateNode?.setAttribute?.(
              "data-rdt-source",
              `${fileName}:::${isJsx ? line - 20 : line}` //
            );
          }
          if (fiberNode?.stateNode && fiberNode?.elementType === "form") {
            findIncorrectHtml(fiberNode.child, fiberNode, "form");
          }
          if (fiberNode?.stateNode && fiberNode?.elementType === "a") {
            findIncorrectHtml(fiberNode.child, fiberNode, "a");
          }
          if (fiberNode?.stateNode && fiberNode?.elementType === "p") {
            findIncorrectHtml(fiberNode.child, fiberNode, "p");
          }
          if (fiberNode?.stateNode && ["h1", "h2", "h3", "h4", "h5", "h6"].includes(fiberNode?.elementType)) {
            findIncorrectHtml(fiberNode.child, fiberNode, fiberNode?.elementType);
          }
          if (fiberNode?.elementType?.name === "default" || fiberNode?.elementType?.name === "RenderedRoute") {
            styleNearestElement(fiberNode);
          }
        });
      }
    }

    setHtmlErrors(invalidHtmlCollection.current);
    invalidHtmlCollection.current = [];
  }, [navigation.state, styleNearestElement, traverseComponentTree, findIncorrectHtml, setHtmlErrors]);
}
