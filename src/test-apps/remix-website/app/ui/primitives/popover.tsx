/**
 * Welcome to @reach/popover!
 */

import * as React from "react";
import { Portal } from "./portal";
import type { Rect } from "./rect";
import { useRect } from "./rect";
import { getOwnerDocument, useComposedRefs } from "./utils";
import { forwardRef } from "./polymorphic";
import { tabbable } from "tabbable";

// TODO: tabbable types incorrectly exclude `document` as a param. Open a PR to
// fix and get rid of `as any` casting.

////////////////////////////////////////////////////////////////////////////////

const Popover = forwardRef<PopoverProps, "div">(
  ({ unstable_skipRenderBeforeHydration, ...props }, ref) => {
    return (
      <Portal
        unstable_skipRenderBeforeHydration={unstable_skipRenderBeforeHydration}
      >
        <PopoverImpl ref={ref} {...props} />
      </Portal>
    );
  },
);

Popover.displayName = "Popover";

interface PopoverProps {
  children: React.ReactNode;
  targetRef: React.RefObject<PossibleElement>;
  position?: PositionPopover;
  /**
   * Render the popover markup, but hide it – used by MenuButton so that it
   * can have an `aria-controls` attribute even when its menu isn't open, and
   * used inside `Popover` as a hint that we can tell `useRect` to stop
   * observing for better performance.
   */
  hidden?: boolean;
  /**
   * Testing this API so we might accept additional nodes that apps can use to
   * determine the position of the popover. One example where it may be useful
   * is for positioning the popover of a listbox where the cursor rests on top
   * of the selected option. Pretty sure this will change so don't use it
   * anywhere in public yet!
   */
  unstable_skipRenderBeforeHydration?: boolean;
}

/**
 * Popover is conditionally rendered so we can't start measuring until it shows
 * up, so `useRect` needs to live down here not up in Popover
 */
const PopoverImpl = forwardRef<PopoverProps, "div">(
  (
    { as: Comp = "div", targetRef, position = positionDefault, ...props },
    forwardedRef,
  ) => {
    let popoverRef = React.useRef<HTMLDivElement>(null);
    let popoverRect = useRect(popoverRef, { observe: !props.hidden });
    let targetRect = useRect(targetRef, { observe: true });
    let ref = useComposedRefs(popoverRef, forwardedRef);

    useSimulateTabNavigationForReactTree(targetRef as any, popoverRef);

    let popoverStyles = getStyles(position, targetRect, popoverRect);

    return (
      <Comp
        data-reach-popover=""
        ref={ref}
        {...props}
        style={{
          position: "absolute",
          ...popoverStyles,
          ...props.style,
        }}
      />
    );
  },
);

PopoverImpl.displayName = "PopoverImpl";

function getStyles(
  position: PositionPopover,
  targetRect: Rect | null,
  popoverRect: Rect | null,
): React.CSSProperties {
  let needToMeasurePopup = !popoverRect;
  if (needToMeasurePopup) {
    return { visibility: "hidden" };
  }
  return position(targetRect, popoverRect);
}

function getTopPosition(
  targetRect: Rect,
  popoverRect: Rect,
  isDirectionUp: boolean,
) {
  return {
    top: isDirectionUp
      ? `${targetRect.top - popoverRect.height + window.pageYOffset}px`
      : `${targetRect.top + targetRect.height + window.pageYOffset}px`,
  };
}

const positionDefault: PositionPopover = (targetRect, popoverRect) => {
  if (!targetRect || !popoverRect) {
    return {};
  }

  let { directionRight, directionUp } = getCollisions(targetRect, popoverRect);
  return {
    left: directionRight
      ? `${targetRect.right - popoverRect.width + window.pageXOffset}px`
      : `${targetRect.left + window.pageXOffset}px`,
    ...getTopPosition(targetRect, popoverRect, directionUp),
  };
};

const positionRight: PositionPopover = (targetRect, popoverRect) => {
  if (!targetRect || !popoverRect) {
    return {};
  }

  let { directionLeft, directionUp } = getCollisions(targetRect, popoverRect);
  return {
    left: directionLeft
      ? `${targetRect.left + window.pageXOffset}px`
      : `${targetRect.right - popoverRect.width + window.pageXOffset}px`,
    ...getTopPosition(targetRect, popoverRect, directionUp),
  };
};

const positionMatchWidth: PositionPopover = (targetRect, popoverRect) => {
  if (!targetRect || !popoverRect) {
    return {};
  }

  let { directionUp } = getCollisions(targetRect, popoverRect);
  return {
    width: targetRect.width,
    left: targetRect.left,
    ...getTopPosition(targetRect, popoverRect, directionUp),
  };
};

function getCollisions(
  targetRect: Rect,
  popoverRect: Rect,
  offsetLeft: number = 0,
  offsetBottom: number = 0,
) {
  let collisions = {
    top: targetRect.top - popoverRect.height < 0,
    right: window.innerWidth < targetRect.left + popoverRect.width - offsetLeft,
    bottom:
      window.innerHeight <
      targetRect.bottom + popoverRect.height - offsetBottom,
    left: targetRect.left + targetRect.width - popoverRect.width < 0,
  };

  let directionRight = collisions.right && !collisions.left;
  let directionLeft = collisions.left && !collisions.right;
  let directionUp = collisions.bottom && !collisions.top;
  let directionDown = collisions.top && !collisions.bottom;

  return { directionRight, directionLeft, directionUp, directionDown };
}

// Heads up, my jQuery past haunts this function. This hook scopes the tab order
// to the React element tree, instead of the DOM tree. This way, when the user
// navigates with tab from the targetRef, the tab order moves into the popup,
// and then out of the popup back to the rest of the document. (We call
// targetRef, triggerRef inside this function to avoid confusion with
// event.target)
function useSimulateTabNavigationForReactTree<
  T extends HTMLElement,
  P extends HTMLElement,
>(triggerRef: React.RefObject<T>, popoverRef: React.RefObject<P>) {
  let ownerDocument = getOwnerDocument(triggerRef.current)!;

  function handleKeyDown(event: KeyboardEvent) {
    if (
      event.key === "Tab" &&
      popoverRef.current &&
      tabbable(popoverRef.current).length === 0
    ) {
      return;
    }

    if (event.key === "Tab" && event.shiftKey) {
      if (shiftTabbedFromElementAfterTrigger(event)) {
        focusLastTabbableInPopover(event);
      } else if (shiftTabbedOutOfPopover(event)) {
        focusTriggerRef(event);
      } else if (shiftTabbedToBrowserChrome(event)) {
        disableTabbablesInPopover();
      }
    } else if (event.key === "Tab") {
      if (tabbedFromTriggerToPopover()) {
        focusFirstPopoverTabbable(event);
      } else if (tabbedOutOfPopover()) {
        focusTabbableAfterTrigger(event);
      } else if (tabbedToBrowserChrome(event)) {
        disableTabbablesInPopover();
      }
    }
  }

  React.useEffect(() => {
    ownerDocument.addEventListener("keydown", handleKeyDown);
    return () => {
      ownerDocument.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getElementAfterTrigger() {
    let elements = tabbable(ownerDocument as any);
    let targetIndex =
      elements && triggerRef.current
        ? elements.indexOf(triggerRef.current)
        : -1;
    let elementAfterTrigger = elements && elements[targetIndex + 1];
    return popoverRef.current &&
      popoverRef.current.contains(elementAfterTrigger || null)
      ? false
      : elementAfterTrigger;
  }

  function tabbedFromTriggerToPopover() {
    return triggerRef.current
      ? triggerRef.current === ownerDocument.activeElement
      : false;
  }

  function focusFirstPopoverTabbable(event: KeyboardEvent) {
    let elements = popoverRef.current && tabbable(popoverRef.current);
    if (elements && elements[0]) {
      event.preventDefault();
      elements[0].focus();
    }
  }

  function tabbedOutOfPopover() {
    let inPopover = popoverRef.current
      ? popoverRef.current.contains(ownerDocument.activeElement || null)
      : false;
    if (inPopover) {
      let elements = popoverRef.current && tabbable(popoverRef.current);
      return Boolean(
        elements &&
          elements[elements.length - 1] === ownerDocument.activeElement,
      );
    }
    return false;
  }

  function focusTabbableAfterTrigger(event: KeyboardEvent) {
    let elementAfterTrigger = getElementAfterTrigger();
    if (elementAfterTrigger) {
      event.preventDefault();
      elementAfterTrigger.focus();
    }
  }

  function shiftTabbedFromElementAfterTrigger(event: KeyboardEvent) {
    if (!event.shiftKey) return;
    let elementAfterTrigger = getElementAfterTrigger();
    return event.target === elementAfterTrigger;
  }

  function focusLastTabbableInPopover(event: KeyboardEvent) {
    let elements = popoverRef.current && tabbable(popoverRef.current);
    let last = elements && elements[elements.length - 1];
    if (last) {
      event.preventDefault();
      last.focus();
    }
  }

  function shiftTabbedOutOfPopover(event: KeyboardEvent) {
    let elements = popoverRef.current && tabbable(popoverRef.current);
    if (elements) {
      return elements.length === 0 ? false : event.target === elements[0];
    }
    return false;
  }

  function focusTriggerRef(event: KeyboardEvent) {
    event.preventDefault();
    triggerRef.current?.focus();
  }

  function tabbedToBrowserChrome(event: KeyboardEvent) {
    let elements = popoverRef.current
      ? tabbable(ownerDocument as any).filter(
          (element) => !popoverRef.current!.contains(element),
        )
      : null;
    return elements ? event.target === elements[elements.length - 1] : false;
  }

  function shiftTabbedToBrowserChrome(event: KeyboardEvent) {
    // we're assuming the popover will never contain the first tabbable
    // element, and it better not, because the trigger needs to be tabbable!
    return event.target === tabbable(ownerDocument as any)[0];
  }

  let restoreTabIndexTuplés: [HTMLElement | SVGElement, number][] = [];

  function disableTabbablesInPopover() {
    let elements = popoverRef.current && tabbable(popoverRef.current);
    if (elements) {
      elements.forEach((element) => {
        restoreTabIndexTuplés.push([element, element.tabIndex]);
        element.tabIndex = -1;
      });
      ownerDocument.addEventListener("focusin", enableTabbablesInPopover);
    }
  }

  function enableTabbablesInPopover() {
    ownerDocument.removeEventListener("focusin", enableTabbablesInPopover);
    restoreTabIndexTuplés.forEach(([element, tabIndex]) => {
      element.tabIndex = tabIndex;
    });
  }
}

interface PositionPopover {
  (
    targetRect?: Rect | null,
    popoverRect?: Rect | null,
    ...unstable_observableElements: PossibleElement[]
  ): React.CSSProperties;
}

type FocusableElement = HTMLElement | SVGElement;
type PossibleElement = null | undefined | FocusableElement;

export type { PopoverProps, PositionPopover };
export {
  getCollisions,
  Popover,
  positionDefault,
  positionMatchWidth,
  positionRight,
};
