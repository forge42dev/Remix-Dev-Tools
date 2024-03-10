/**
 * Welcome to @reach/rect!
 *
 * Measures a DOM element's bounding client rect
 *
 * @see getBoundingClientRect https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
 * @see Docs                  TODO
 * @see Source                TODO
 */

import * as React from "react";
import { observeRect, getRect, rectChanged } from "~/lib/observe-rect";
import { useLayoutEffect } from "./utils";

/**
 * Measures a DOM element's bounding client rect
 *
 * @param nodeRef
 * @param options
 */
function useRect<T extends Element = HTMLElement>(
  nodeRef: React.RefObject<T | undefined | null>,
  options: UseRectOptions = {},
): null | Rect {
  let { observe, onChange } = options;
  let [element, setElement] = React.useState<T | null | undefined>(null);
  let [rect, setRect] = React.useState<DOMRect | null>(null);
  let onChangeRef = React.useRef(onChange);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // This should never trigger an endless loop because the ref should point to a
  // stable node reference or null/undefined. If it's anything else, it's a user
  // problem and we should probably catch that with a custom error.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    setElement(nodeRef.current);
  });

  useLayoutEffect(() => {
    let node = element || nodeRef.current;
    if (!node) {
      // TODO: Consider a warning, we should probably have a ref here (I think)
      return;
    }

    let currentRect = getRect(node);
    setRect((prevRect) => {
      if (!prevRect || rectChanged(prevRect, currentRect)) {
        return currentRect;
      }
      return prevRect;
    });

    let observer = observeRect(node, (rect) => {
      onChangeRef.current?.(rect);
      setRect(rect);
    });

    observer.observe();
    return () => {
      observer.unobserve();
    };
  }, [nodeRef, element, observe]);

  return rect;
}

/**
 * @see Docs https://TODO.com/rect#userect
 */
interface UseRectOptions {
  /**
   * Tells `Rect` to observe the position of the node or not. While observing,
   * the `children` render prop may call back very quickly (especially while
   * scrolling) so it can be important for performance to avoid observing when
   * you don't need to.
   *
   * This is typically used for elements that pop over other elements (like a
   * dropdown menu), so you don't need to observe all the time, only when the
   * popup is active.
   *
   * Pass `true` to observe, `false` to ignore.
   *
   * @see Docs https://TODO.com/rect#userect-observe
   */
  observe?: boolean;
  /**
   * Calls back whenever the `rect` of the element changes.
   *
   * @see Docs https://TODO.com/rect#userect-onchange
   */
  onChange?(rect: Rect): void;
}

interface Rect extends Partial<DOMRect> {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type { Rect, UseRectOptions };
export { useRect };
