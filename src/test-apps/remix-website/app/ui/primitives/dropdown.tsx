import * as React from "react";
import { Popover } from "./popover";
import {
  createCollectionContext,
  CollectionProvider,
  useCollectionItem,
  useCollection,
  useCollectionInit,
} from "./collection";
import {
  composeEventHandlers,
  createContext,
  getOwnerDocument,
  isFunction,
  isRightClick,
  useComposedRefs,
  makeId,
  isAnchorElement,
} from "./utils";
import type * as Polymorphic from "./polymorphic";

import type { CollectionItem } from "./collection";
import type { PositionPopover } from "./popover";

////////////////////////////////////////////////////////////////////////////////
// Actions

const CLEAR_SELECTION_INDEX = "CLEAR_SELECTION_INDEX";
const CLICK_MENU_ITEM = "CLICK_MENU_ITEM";
const CLOSE_MENU = "CLOSE_MENU";
const OPEN_MENU_AT_FIRST_ITEM = "OPEN_MENU_AT_FIRST_ITEM";
const OPEN_MENU_AT_INDEX = "OPEN_MENU_AT_INDEX";
const OPEN_MENU_CLEARED = "OPEN_MENU_CLEARED";
const TYPEAHEAD_SEARCH = "TYPEAHEAD_SEARCH";
const CLEAR_TYPEAHEAD = "CLEAR_TYPEAHEAD";
const SET_ACTIVE_ITEM = "SET_ACTIVE_ITEM";
const SET_BUTTON_ID = "SET_BUTTON_ID";

const DropdownCollectionContext = createCollectionContext<
  FocusableElement,
  DropdownCollectionItem
>("DropdownCollectionContext");
const [DropdownProvider, useDropdownContext] =
  createContext<InternalDropdownContextValue>("Dropdown");

const initialState: DropdownState = {
  // The button ID is needed for aria controls and can be set directly and
  // updated for top-level use via context. Otherwise a default is set by useId.
  // TODO: Consider deprecating direct ID in 1.0 in favor of id at the top level
  //       for passing deterministic IDs to descendent components.
  triggerId: null,

  // Whether or not the dropdown is expanded
  isExpanded: false,

  // When a user begins typing a character string, the selection will change if
  // a matching item is found
  typeaheadQuery: "",

  // The index of the current selected item. When the selection is cleared a
  // value of -1 is used.
  activeItemIndex: -1,
};

////////////////////////////////////////////////////////////////////////////////

// Dropdown!

const DropdownProvider_: React.FC<DropdownProviderProps> = ({
  id,
  children,
}) => {
  let triggerRef = React.useRef<FocusableElement | null>(null);
  let dropdownRef = React.useRef<FocusableElement | null>(null);
  let popoverRef = React.useRef<FocusableElement | null>(null);
  let [collection, setCollection] = useCollectionInit<DropdownCollectionItem>();
  let generatedId = React.useId();
  let dropdownId = id || makeId("menu", generatedId);
  let triggerId = makeId("menu-button", dropdownId);
  let [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
    triggerId,
  });

  // We use an event listener attached to the window to capture outside clicks
  // that close the dropdown. We don't want the initial button click to trigger
  // this when a dropdown is closed, so we can track this behavior in a ref for
  // now. We shouldn't need this when we rewrite with state machine logic.
  let triggerClickedRef = React.useRef(false);

  // We will put children callbacks in a ref to avoid triggering endless render
  // loops when using render props if the app code doesn't useCallback
  // https://github.com/reach/reach-ui/issues/523
  let selectCallbacks = React.useRef([]);

  // If the popover's position overlaps with an option when the popover
  // initially opens, the mouseup event will trigger a select. To prevent that,
  // we decide the control is only ready to make a selection if the pointer
  // moves a certain distance OR if the mouse button is pressed for a certain
  // length of time, otherwise the user is just registering the initial button
  // click rather than selecting an item.
  // For context on some implementation details, see https://github.com/reach/reach-ui/issues/563
  let readyToSelect = React.useRef(false);
  let mouseDownStartPosRef = React.useRef({ x: 0, y: 0 });

  // When the dropdown is open, focus is placed on the dropdown itself so that
  // keyboard navigation is still possible.
  React.useEffect(() => {
    if (state.isExpanded) {
      // @ts-ignore
      window.__REACH_DISABLE_TOOLTIPS = true;
      window.requestAnimationFrame(() => {
        dropdownRef.current?.focus();
      });
    } else {
      // We want to ignore the immediate focus of a tooltip so it doesn't pop up
      // again when the dropdown closes, only pops up when focus returns again
      // to the tooltip (like native OS tooltips).
      // @ts-ignore
      window.__REACH_DISABLE_TOOLTIPS = false;
    }
  }, [state.isExpanded]);

  React.useEffect(() => {
    if (!state.isExpanded) {
      dispatch({ type: CLEAR_SELECTION_INDEX });
    }
  }, [state.isExpanded]);

  return (
    <CollectionProvider
      context={DropdownCollectionContext}
      items={collection}
      set={setCollection}
    >
      <DropdownProvider
        dispatch={dispatch}
        dropdownId={dropdownId}
        dropdownRef={dropdownRef}
        mouseDownStartPosRef={mouseDownStartPosRef}
        popoverRef={popoverRef}
        readyToSelect={readyToSelect}
        selectCallbacks={selectCallbacks}
        state={state}
        triggerClickedRef={triggerClickedRef}
        triggerRef={triggerRef}
      >
        {isFunction(children)
          ? children({
              isExpanded: state.isExpanded,
              // TODO: Remove in 1.0
              isOpen: state.isExpanded,
            })
          : children}
      </DropdownProvider>
    </CollectionProvider>
  );
};

interface DropdownProviderProps {
  children:
    | React.ReactNode
    | ((
        props: DropdownContextValue & {
          // TODO: Remove in 1.0
          isOpen: boolean;
        },
      ) => React.ReactNode);
  id?: string;
}

DropdownProvider_.displayName = "DropdownProvider";

////////////////////////////////////////////////////////////////////////////////

function useDropdownTrigger<Elem extends FocusableElement = FocusableElement>({
  onKeyDown,
  onMouseDown,
  id,
  ref: forwardedRef,
  ...props
}: UseDropdownTriggerProps<Elem>) {
  let {
    dispatch,
    dropdownId,
    mouseDownStartPosRef,
    triggerClickedRef,
    triggerRef,
    state: { triggerId, isExpanded },
  } = useDropdownContext("useDropdownTrigger");
  let ref = useComposedRefs(triggerRef, forwardedRef);
  let items = useDropdownCollection();
  let firstNonDisabledIndex = React.useMemo(
    () => items.findIndex((item) => !item.disabled),
    [items],
  );
  React.useEffect(() => {
    if (id != null && id !== triggerId) {
      dispatch({
        type: SET_BUTTON_ID,
        payload: id,
      });
    }
  }, [triggerId, dispatch, id]);
  React.useEffect(() => {
    if (id == null) {
      dispatch({
        type: SET_BUTTON_ID,
        payload: makeId("menu-button", dropdownId),
      });
    }
  }, [dropdownId, dispatch, id]);

  let handleKeyDown = React.useMemo(
    () =>
      composeEventHandlers(onKeyDown, function handleKeyDown(event) {
        switch (event.key) {
          case "ArrowDown":
          case "ArrowUp":
            event.preventDefault(); // prevent scroll
            dispatch({
              type: OPEN_MENU_AT_INDEX,
              payload: { index: firstNonDisabledIndex },
            });
            break;
          case "Enter":
          case " ":
            dispatch({
              type: OPEN_MENU_AT_INDEX,
              payload: { index: firstNonDisabledIndex },
            });
            break;
          default:
            break;
        }
      }),
    [onKeyDown, dispatch, firstNonDisabledIndex],
  );

  let handleMouseDown = React.useMemo(
    () =>
      composeEventHandlers(onMouseDown, function handleMouseDown(event) {
        if (isRightClick(event.nativeEvent)) {
          return;
        }

        mouseDownStartPosRef.current = {
          x: event.clientX,
          y: event.clientY,
        };

        if (!isExpanded) {
          triggerClickedRef.current = true;
        }
        if (isExpanded) {
          dispatch({ type: CLOSE_MENU });
        } else {
          dispatch({ type: OPEN_MENU_CLEARED });
        }
      }),
    [
      onMouseDown,
      mouseDownStartPosRef,
      isExpanded,
      triggerClickedRef,
      dispatch,
    ],
  );

  return {
    data: {
      isExpanded,
      controls: dropdownId,
    },
    props: {
      ...props,
      ref,
      id: triggerId || undefined,
      onKeyDown: handleKeyDown,
      onMouseDown: handleMouseDown,
      type: "button" as const,
    },
  };
}

const DropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownTriggerProps
>((props, forwardedRef) => {
  let { props: allProps } = useDropdownTrigger({ ...props, ref: forwardedRef });
  return <button data-reach-dropdown-trigger="" {...allProps} />;
});

interface DropdownTriggerOwnProps {}

interface DropdownTriggerProps
  extends DropdownTriggerOwnProps,
    Omit<
      React.ComponentPropsWithRef<"button">,
      keyof DropdownTriggerOwnProps
    > {}

interface UseDropdownTriggerProps<
  Elem extends FocusableElement = FocusableElement,
> extends DropdownTriggerOwnProps,
    React.HTMLAttributes<Elem> {
  ref?: React.Ref<Elem>;
}

DropdownTrigger.displayName = "DropdownTrigger";

////////////////////////////////////////////////////////////////////////////////

function useDropdownItem<Elem extends FocusableElement = FocusableElement>({
  index,
  onClick,
  onDragStart,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onMouseUp,
  onSelect,
  disabled,
  onFocus,
  valueText: valueTextProp,
  ref: forwardedRef,
  ...props
}: UseDropdownItemProps<Elem>) {
  let {
    dispatch,
    dropdownRef,
    mouseDownStartPosRef,
    readyToSelect,
    selectCallbacks,
    triggerRef,
    state: { activeItemIndex, isExpanded },
  } = useDropdownContext("useDropdownItem");

  let ownRef = React.useRef<Elem | null>(null);
  // After the ref is mounted to the DOM node, we check to see if we have an
  // explicit valueText prop before looking for the node's textContent for
  // typeahead functionality.
  let [valueText, setValueText] = React.useState(valueTextProp || "");

  let setValueTextFromDOM = React.useCallback(
    (node: Elem) => {
      if (!valueTextProp && node?.textContent) {
        setValueText(node.textContent);
      }
    },
    [valueTextProp],
  );

  let mouseEventStarted = React.useRef(false);

  let [element, setElement] = React.useState<Elem | null>(null);
  let handleRefSet = React.useCallback((node: Elem | null) => {
    setElement(node);
  }, []);

  let key = "dropdown-item:" + React.useId();
  let collectionItem: DropdownCollectionItem<Elem> = React.useMemo(() => {
    return {
      element,
      key,
      disabled,
      index,
    };
  }, [disabled, element, index, key]);
  useCollectionItem(collectionItem, DropdownCollectionContext);
  let isSelected = index === activeItemIndex && !disabled;

  let ref = useComposedRefs(forwardedRef, handleRefSet, setValueTextFromDOM);

  // Update the callback ref array on every render
  selectCallbacks.current[index] = onSelect;

  let select = React.useCallback(() => {
    triggerRef.current?.focus();
    onSelect && onSelect();
    dispatch({ type: CLICK_MENU_ITEM });
  }, [dispatch, onSelect, triggerRef]);

  let handleClick = React.useMemo(
    () =>
      composeEventHandlers(onClick, function handleClick(event) {
        if (isRightClick(event.nativeEvent)) {
          return;
        }

        if (isAnchorElement(element)) {
          if (disabled) {
            event.preventDefault();
          } else {
            select();
          }
        }
      }),
    [onClick, element, select, disabled],
  );

  let handleDragStart = React.useMemo(
    () =>
      composeEventHandlers(onDragStart, function handleDragStart(event) {
        // Because we don't preventDefault on mousedown for links (we need the
        // native click event), clicking and holding on a link triggers a
        // dragstart which we don't want.
        if (isAnchorElement(element)) {
          event.preventDefault();
        }
      }),
    [onDragStart, element],
  );

  let handleMouseDown = React.useMemo(
    () =>
      composeEventHandlers(onMouseDown, function handleMouseDown(event) {
        if (isRightClick(event.nativeEvent)) {
          return;
        }

        if (isAnchorElement(element)) {
          // Signal that the mouse is down so we can call the right function if the
          // user is clicking on a link.
          mouseEventStarted.current = true;
        } else {
          event.preventDefault();
        }
      }),
    [onMouseDown, element],
  );

  let handleMouseEnter = React.useMemo(
    () =>
      composeEventHandlers(onMouseEnter, function handleMouseEnter(event) {
        let doc = getOwnerDocument(dropdownRef.current);
        if (!isSelected && index != null && !disabled) {
          if (
            dropdownRef?.current &&
            dropdownRef.current !== doc.activeElement &&
            ownRef.current !== doc.activeElement
          ) {
            dropdownRef.current.focus();
          }
          dispatch({
            type: SET_ACTIVE_ITEM,
            payload: {
              index,
            },
          });
        }
      }),
    [onMouseEnter, dropdownRef, isSelected, index, disabled, dispatch],
  );

  let handleMouseLeave = React.useMemo(
    () =>
      composeEventHandlers(onMouseLeave, function handleMouseLeave(event) {
        // Clear out selection when mouse over a non-dropdown-item child.
        dispatch({ type: CLEAR_SELECTION_INDEX });
      }),
    [dispatch, onMouseLeave],
  );

  let handleMouseMove = React.useMemo(
    () =>
      composeEventHandlers(onMouseMove, function handleMouseMove(event) {
        if (!readyToSelect.current) {
          let threshold = 8;
          let deltaX = Math.abs(event.clientX - mouseDownStartPosRef.current.x);
          let deltaY = Math.abs(event.clientY - mouseDownStartPosRef.current.y);
          if (deltaX > threshold || deltaY > threshold) {
            readyToSelect.current = true;
          }
        }
        if (!isSelected && index != null && !disabled) {
          dispatch({
            type: SET_ACTIVE_ITEM,
            payload: {
              index,
              dropdownRef,
            },
          });
        }
      }),
    [
      onMouseMove,
      readyToSelect,
      isSelected,
      index,
      disabled,
      mouseDownStartPosRef,
      dispatch,
      dropdownRef,
    ],
  );

  let handleFocus = React.useMemo(
    () =>
      composeEventHandlers(onFocus, function handleFocus(event) {
        readyToSelect.current = true;
        if (!isSelected && index != null && !disabled) {
          dispatch({
            type: SET_ACTIVE_ITEM,
            payload: {
              index,
            },
          });
        }
      }),
    [onFocus, readyToSelect, isSelected, index, disabled, dispatch],
  );

  let handleMouseUp = React.useMemo(
    () =>
      composeEventHandlers(onMouseUp, function handleMouseUp(event) {
        if (isRightClick(event.nativeEvent)) {
          return;
        }

        if (!readyToSelect.current) {
          readyToSelect.current = true;
          return;
        }

        if (isAnchorElement(element)) {
          // If a mousedown event was initiated on a link item followed by a mouseup
          // event on the same link, we do nothing; a click event will come next and
          // handle selection. Otherwise, we trigger a click event.
          if (mouseEventStarted.current) {
            mouseEventStarted.current = false;
          } else {
            (ownRef.current as HTMLAnchorElement | null)?.click();
          }
        } else {
          if (!disabled) {
            select();
          }
        }
      }),
    [onMouseUp, readyToSelect, element, disabled, select],
  );

  React.useEffect(() => {
    if (isExpanded) {
      // When the dropdown opens, wait for about half a second before enabling
      // selection. This is designed to mirror dropdown menus on macOS, where
      // opening a menu on top of a trigger would otherwise result in an
      // immediate accidental selection once the click trigger is released.
      let id = window.setTimeout(() => {
        readyToSelect.current = true;
      }, 400);
      return () => {
        window.clearTimeout(id);
      };
    } else {
      // When the dropdown closes, reset readyToSelect for the next interaction.
      readyToSelect.current = false;
    }
  }, [isExpanded, readyToSelect]);

  // Any time a mouseup event occurs anywhere in the document, we reset the
  // mouseEventStarted ref so we can check it again when needed.
  React.useEffect(() => {
    let ownerDocument = getOwnerDocument(ownRef.current)!;
    ownerDocument.addEventListener("mouseup", listener);
    return () => {
      ownerDocument.removeEventListener("mouseup", listener);
    };

    function listener() {
      mouseEventStarted.current = false;
    }
  }, []);

  return {
    data: {
      disabled,
    },
    props: {
      id: useItemId(index),
      tabIndex: -1,
      ...props,
      ref,
      "data-disabled": disabled ? "" : undefined,
      "data-selected": isSelected ? "" : undefined,
      "data-valuetext": valueText,
      onClick: handleClick,
      onDragStart: handleDragStart,
      onMouseDown: handleMouseDown,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseMove: handleMouseMove,
      onFocus: handleFocus,
      onMouseUp: handleMouseUp,
    },
  };
}

/**
 * DropdownItem
 */
const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  (rest, forwardedRef) => {
    let { props } = useDropdownItem({ ...rest, ref: forwardedRef });
    return <div data-reach-dropdown-item="" {...props} />;
  },
);

interface DropdownItemOwnProps {
  onSelect(): void;
  index: number;
  valueText?: string;
  disabled?: boolean;
}

interface DropdownItemProps
  extends DropdownItemOwnProps,
    Omit<React.ComponentPropsWithRef<"div">, keyof DropdownItemOwnProps> {}

interface UseDropdownItemProps<Elem extends FocusableElement = FocusableElement>
  extends DropdownItemOwnProps,
    Omit<React.HTMLAttributes<Elem>, keyof DropdownItemOwnProps> {
  ref?: React.Ref<Elem>;
}

DropdownItem.displayName = "DropdownItem";

////////////////////////////////////////////////////////////////////////////////

function useDropdownItems<Elem extends FocusableElement = FocusableElement>({
  id,
  onKeyDown,
  ref: forwardedRef,
  cycleSelection = false,
  orientation = "vertical",
  ...props
}: UseDropdownItemsProps<Elem>) {
  let {
    dispatch,
    triggerRef,
    dropdownRef,
    selectCallbacks,
    dropdownId,
    state: { isExpanded, triggerId, activeItemIndex, typeaheadQuery },
  } = useDropdownContext("useDropdownItems");

  let items = useDropdownCollection();
  let ref = useComposedRefs(dropdownRef, forwardedRef);

  React.useEffect(() => {
    let timeout = window.setTimeout(
      () => typeaheadQuery && dispatch({ type: CLEAR_TYPEAHEAD }),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [dispatch, typeaheadQuery]);

  let prevItemsLengthRef = React.useRef<number | null>(null);
  let prevSelectedRef = React.useRef<DropdownCollectionItem | null>(null);
  let prevActiveItemIndexRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let prevItemsLength = prevItemsLengthRef.current;
    let prevSelected = prevSelectedRef.current;
    let prevActiveItemIndex = prevActiveItemIndexRef.current;

    if (activeItemIndex > items.length - 1) {
      // If for some reason our selection index is larger than our possible
      // index range (let's say the last item is selected and the list
      // dynamically updates), we need to select the last item in the list.
      dispatch({
        type: SET_ACTIVE_ITEM,
        payload: {
          index: items.length - 1,
          dropdownRef,
        },
      });
    } else if (
      // Checks if
      //  - item length has changed
      //  - selection index has not changed BUT selected item has changed
      //
      // This prevents any dynamic adding/removing of items from actually
      // changing a user's expected selection.
      prevItemsLength !== items.length &&
      activeItemIndex > -1 &&
      prevSelected &&
      prevActiveItemIndex === activeItemIndex &&
      items[activeItemIndex] !== prevSelected
    ) {
      dispatch({
        type: SET_ACTIVE_ITEM,
        payload: {
          index: items.findIndex((i) => i.key === prevSelected?.key),
          dropdownRef,
        },
      });
    }
  }, [dropdownRef, dispatch, items, activeItemIndex]);

  // This is the most annoying thing in the world but I'm pretty sure it's the
  // only reliable way to track changing values in the previous effect in a way
  // that plays nice with concurrent shenanigans / strict mode. Please help me.
  React.useEffect(() => {
    prevItemsLengthRef.current = items.length;
  }, [items.length]);

  let selectedItem = items[activeItemIndex];
  React.useEffect(() => {
    prevSelectedRef.current = selectedItem;
  }, [selectedItem]);

  React.useEffect(() => {
    prevActiveItemIndexRef.current = activeItemIndex;
  }, [activeItemIndex]);

  let handleKeyDown = React.useMemo(
    () =>
      composeEventHandlers(onKeyDown, function handleKeyDown(event) {
        if (!isExpanded) {
          return;
        }

        if (isNavigationKeyboardEvent(event, { orientation })) {
          event.preventDefault();
          let selectableItems = items.filter((item) => !item.disabled);
          if (!selectableItems.length) {
            return;
          }

          let selectableIndex = selectableItems.findIndex(
            (item) => item.index === activeItemIndex,
          );
          let index = activeItemIndex;
          switch (event.key) {
            case "ArrowDown":
            case "ArrowRight": {
              let next = getNextOption();
              select(next.index);
              break;
            }
            case "ArrowUp":
            case "ArrowLeft": {
              let prev = getPrevious();
              select(prev.index);
              break;
            }
            case "PageUp": {
              let prevOrFirst = (event.ctrlKey ? getPrevious : getFirst)();
              select(prevOrFirst.index);
              break;
            }
            case "Home": {
              let first = getFirst();
              select(first.index);
              break;
            }
            case "PageDown": {
              let nextOrLast = (event.ctrlKey ? getNextOption : getLast)();
              select(nextOrLast.index);
              break;
            }
            case "End": {
              let last = getLast();
              select(last.index);
              break;
            }
            default:
              return;
          }

          function select(index: number) {
            dispatch({
              type: SET_ACTIVE_ITEM,
              payload: { index, dropdownRef },
            });
          }

          function getFirst() {
            return selectableItems[0];
          }

          function getLast() {
            return selectableItems[selectableItems.length - 1];
          }

          function getNextOption() {
            let atBottom = index === getLast().index;
            return atBottom
              ? cycleSelection
                ? getFirst()
                : selectableItems[selectableIndex]
              : selectableItems[(selectableIndex + 1) % selectableItems.length];
          }

          function getPrevious() {
            let atTop = index === getFirst().index;
            return atTop
              ? cycleSelection
                ? getLast()
                : selectableItems[selectableIndex]
              : selectableItems[
                  (selectableIndex - 1 + selectableItems.length) %
                    selectableItems.length
                ];
          }
        } else {
          switch (event.key) {
            case "Enter":
            case " ": {
              let selected = items.find(
                (item) => item.index === activeItemIndex,
              );
              if (!selected || selected.disabled) {
                return;
              }

              event.preventDefault();

              // For links, the Enter key will trigger a 'click' event by default, so we
              // add it back for consistency since we always prevent other default
              // behavior. This also triggers the click for spacebar as well for
              // consistency with other non-link items in the dropdown.
              if (isAnchorElement(selected.element)) {
                selected.element.click();
              } else {
                // Focus the button first by default when an item is selected. We fire the
                // `onSelect` callback next so the app can manage focus if needed.
                // TODO: This could be a lot clearer, clean this up
                triggerRef.current?.focus();
                selectCallbacks.current[selected.index]?.();
                dispatch({ type: CLICK_MENU_ITEM });
              }
            }
            case "Escape": {
              triggerRef.current?.focus();
              dispatch({ type: CLOSE_MENU });
              break;
            }
            case "Tab": {
              // prevent leaving
              // TODO: Are we sure?
              event.preventDefault();
              break;
            }
            default: {
              // Check if a user is typing some char keys and respond by setting
              // the query state.
              if (event.key.length === 1) {
                let query = typeaheadQuery + event.key.toLowerCase();
                dispatch({
                  type: TYPEAHEAD_SEARCH,
                  payload: {
                    query,
                    items,
                  },
                });
              }
              break;
            }
          }
        }
      }),
    [
      cycleSelection,
      dispatch,
      dropdownRef,
      isExpanded,
      items,
      onKeyDown,
      orientation,
      selectCallbacks,
      activeItemIndex,
      triggerRef,
      typeaheadQuery,
    ],
  );

  return {
    data: {
      activeDescendant: useItemId(activeItemIndex) || undefined,
      triggerId,
    },
    props: {
      tabIndex: -1,
      ...props,
      ref,
      id: dropdownId,
      onKeyDown: handleKeyDown,
    },
  };
}

/**
 * DropdownItem
 */
const DropdownItems = React.forwardRef(
  ({ as: Comp = "div", ...rest }, forwardedRef) => {
    let { props } = useDropdownItems({ ...rest, ref: forwardedRef });
    return <Comp data-reach-dropdown-items="" {...props} />;
  },
) as Polymorphic.ForwardRefComponent<"div", DropdownItemsProps>;

interface DropdownItemsOwnProps {
  cycleSelection?: boolean;
  orientation?: "horizontal" | "vertical" | "both";
}

interface DropdownItemsProps extends DropdownItemsOwnProps {
  children: React.ReactNode;
}

interface UseDropdownItemsProps<
  Elem extends FocusableElement = FocusableElement,
> extends DropdownItemsOwnProps,
    React.HTMLAttributes<Elem> {
  ref?: React.Ref<Elem>;
}

DropdownItems.displayName = "DropdownItems";

////////////////////////////////////////////////////////////////////////////////

function useDropdownPopover<Elem extends FocusableElement = FocusableElement>({
  onBlur,
  portal = true,
  position,
  ref: forwardedRef,
  ...props
}: UseDropdownPopoverProps<Elem>): {
  data: {
    portal: boolean;
    position: PositionPopover | undefined;
    targetRef: TriggerRef;
    isExpanded: boolean;
  };
  props: React.HTMLAttributes<Elem> & { ref: React.RefCallback<Elem> };
} {
  let {
    triggerRef,
    triggerClickedRef,
    dispatch,
    dropdownRef,
    popoverRef,
    state: { isExpanded },
  } = useDropdownContext("useDropdownPopover");

  let ref = useComposedRefs(popoverRef, forwardedRef);

  React.useEffect(() => {
    if (!isExpanded) {
      return;
    }

    let ownerDocument = getOwnerDocument(popoverRef.current)!;
    function listener(event: MouseEvent | TouchEvent) {
      if (triggerClickedRef.current) {
        triggerClickedRef.current = false;
      } else if (!popoverRef.current?.contains(event.target as Node)) {
        // We on want to close only if focus rests outside the dropdown
        dispatch({ type: CLOSE_MENU });
      }
    }
    ownerDocument.addEventListener("mousedown", listener);
    // see https://github.com/reach/reach-ui/pull/700#discussion_r530369265
    // ownerDocument.addEventListener("touchstart", listener);
    return () => {
      ownerDocument.removeEventListener("mousedown", listener);
      // ownerDocument.removeEventListener("touchstart", listener);
    };
  }, [
    triggerClickedRef,
    triggerRef,
    dispatch,
    dropdownRef,
    popoverRef,
    isExpanded,
  ]);

  let handleBlur = React.useMemo(
    () =>
      composeEventHandlers(onBlur, (event: React.FocusEvent) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
          return;
        }
        dispatch({ type: CLOSE_MENU });
      }),
    [dispatch, onBlur],
  );

  return {
    data: {
      portal,
      position,
      targetRef: triggerRef,
      isExpanded,
    },
    props: {
      ref,
      hidden: !isExpanded,
      onBlur: handleBlur,
      ...props,
    },
  };
}

const DropdownPopover = React.forwardRef<HTMLDivElement, DropdownPopoverProps>(
  (props, forwardedRef) => {
    let {
      data: { portal, targetRef, position },
      props: allProps,
    } = useDropdownPopover({ ...props, ref: forwardedRef });
    let sharedProps = {
      "data-reach-dropdown-popover": "",
    };
    return portal ? (
      <Popover
        {...allProps}
        {...sharedProps}
        targetRef={targetRef as any}
        position={position}
        children={props.children}
      />
    ) : (
      <div {...allProps} {...sharedProps} />
    );
  },
);

interface DropdownPopoverOwnProps {
  portal?: boolean;
  position?: PositionPopover;
}

interface UseDropdownPopoverProps<
  Elem extends FocusableElement = FocusableElement,
> extends DropdownPopoverOwnProps {
  ref?: React.Ref<Elem>;
  onBlur?: React.FocusEventHandler<Elem>;
}

interface DropdownPopoverProps
  extends DropdownPopoverOwnProps,
    Omit<
      React.ComponentPropsWithRef<"div">,
      keyof DropdownPopoverOwnProps | "children"
    > {
  children: React.ReactNode;
}

DropdownPopover.displayName = "DropdownPopover";

////////////////////////////////////////////////////////////////////////////////

/**
 * When a user's typed input matches the string displayed in an item, it is
 * expected that the matching item is selected. This is our matching function.
 */
function findItemFromTypeahead(
  items: DropdownCollectionItem[],
  string: string = "",
) {
  if (!string) {
    return null;
  }

  let found = items.find((item) => {
    return item.disabled
      ? false
      : item.element?.dataset?.valuetext?.toLowerCase().startsWith(string);
  });
  return found ? items.indexOf(found) : null;
}

function useItemId(index: number | null) {
  let { dropdownId } = useDropdownContext("useItemId");
  return index != null && index > -1
    ? makeId(`option-${index}`, dropdownId)
    : undefined;
}

interface DropdownState {
  isExpanded: boolean;
  activeItemIndex: number;
  triggerId: null | string;
  typeaheadQuery: string;
}

type DropdownAction =
  | { type: "CLICK_MENU_ITEM" }
  | { type: "CLOSE_MENU" }
  | { type: "OPEN_MENU_AT_FIRST_ITEM" }
  | { type: "OPEN_MENU_AT_INDEX"; payload: { index: number } }
  | { type: "OPEN_MENU_CLEARED" }
  | {
      type: "SET_ACTIVE_ITEM";
      payload: {
        dropdownRef?: DropdownRef;
        index: number;
        max?: number;
        min?: number;
      };
    }
  | { type: "CLEAR_SELECTION_INDEX" }
  | { type: "SET_BUTTON_ID"; payload: string }
  | {
      type: "TYPEAHEAD_SEARCH";
      payload: {
        query: string;
        items: DropdownCollectionItem<FocusableElement>[];
      };
    }
  | { type: "CLEAR_TYPEAHEAD" };

function reducer(state: DropdownState, action: DropdownAction): DropdownState {
  switch (action.type) {
    case CLICK_MENU_ITEM:
      return {
        ...state,
        isExpanded: false,
        activeItemIndex: -1,
      };
    case CLOSE_MENU:
      return {
        ...state,
        isExpanded: false,
        activeItemIndex: -1,
      };
    case OPEN_MENU_AT_FIRST_ITEM:
      return {
        ...state,
        isExpanded: true,
        activeItemIndex: 0,
      };
    case OPEN_MENU_AT_INDEX:
      return {
        ...state,
        isExpanded: true,
        activeItemIndex: action.payload.index,
      };
    case OPEN_MENU_CLEARED:
      return {
        ...state,
        isExpanded: true,
        activeItemIndex: -1,
      };
    case SET_ACTIVE_ITEM: {
      let nextActiveItemIndex = getValidActiveItemIndex(action.payload.index, {
        max: action.payload.max,
        currentActiveItemIndex: state.activeItemIndex,
      });

      if (nextActiveItemIndex === state.activeItemIndex) {
        return state;
      }

      return {
        ...state,
        activeItemIndex: nextActiveItemIndex,
      };
    }
    case CLEAR_SELECTION_INDEX: {
      if (state.activeItemIndex !== -1) {
        return {
          ...state,
          activeItemIndex: -1,
        };
      }
      return state;
    }
    case SET_BUTTON_ID:
      return {
        ...state,
        triggerId: action.payload,
      };
    case TYPEAHEAD_SEARCH:
      if (typeof action.payload !== "undefined") {
        let { items, query } = action.payload;
        let match = findItemFromTypeahead(items, query);
        if (query && match != null) {
          let nextActiveItemIndex = getValidActiveItemIndex(match, {
            currentActiveItemIndex: state.activeItemIndex,
          });
          if (
            nextActiveItemIndex === state.activeItemIndex &&
            query === state.typeaheadQuery
          ) {
            return state;
          }
          return {
            ...state,
            activeItemIndex: nextActiveItemIndex,
            typeaheadQuery: query,
          };
        }
      }
      return state;
    case CLEAR_TYPEAHEAD:
      if (state.typeaheadQuery === "") return state;
      return {
        ...state,
        typeaheadQuery: "",
      };
    default:
      return state;
  }
}

function useDropdownCollection() {
  return useCollection(DropdownCollectionContext);
}

////////////////////////////////////////////////////////////////////////////////
// Types

interface DropdownCollectionItem<
  Elem extends FocusableElement = FocusableElement,
> extends CollectionItem<Elem> {
  key: string;
  disabled?: boolean;
}

type FocusableElement = HTMLElement | SVGElement;
type TriggerRef = React.RefObject<null | FocusableElement>;
type DropdownRef = React.RefObject<null | FocusableElement>;
type PopoverRef = React.RefObject<null | FocusableElement>;

interface InternalDropdownContextValue {
  dispatch: React.Dispatch<DropdownAction>;
  dropdownId: string | undefined;
  dropdownRef: DropdownRef;
  mouseDownStartPosRef: React.MutableRefObject<{ x: number; y: number }>;
  popoverRef: PopoverRef;
  readyToSelect: React.MutableRefObject<boolean>;
  selectCallbacks: React.MutableRefObject<(() => void)[]>;
  state: DropdownState;
  triggerClickedRef: React.MutableRefObject<boolean>;
  triggerRef: TriggerRef;
}

interface DropdownContextValue {
  isExpanded: boolean;
}

function isNavigationKeyboardEvent(
  event: React.KeyboardEvent,
  opts: {
    orientation?: "horizontal" | "vertical" | "both";
  },
) {
  let keys = ["PageUp", "PageDown", "Home", "End"];
  if (opts.orientation === "horizontal" || opts.orientation === "both") {
    keys.push("ArrowLeft", "ArrowRight");
  }
  if (opts.orientation === "vertical" || opts.orientation === "both") {
    keys.push("ArrowUp", "ArrowDown");
  }
  return keys.includes(event.key);
}

export type {
  DropdownTriggerProps,
  DropdownItemProps,
  DropdownItemsProps,
  DropdownPopoverProps,
  DropdownProviderProps,
};
export {
  DropdownProvider_ as DropdownProvider,
  DropdownTrigger,
  DropdownItem,
  DropdownItems,
  DropdownPopover,
  useDropdownTrigger,
  useDropdownItem,
  useDropdownItems,
  useDropdownPopover,
  useDropdownContext,
  useDropdownCollection,
};

function getValidActiveItemIndex(
  index: number,
  {
    currentActiveItemIndex,
    max,
  }: {
    currentActiveItemIndex: number;
    max?: number | null;
  },
) {
  if (
    index < 0 ||
    index === currentActiveItemIndex ||
    !Number.isInteger(index)
  ) {
    return currentActiveItemIndex;
  }

  return max != null ? Math.min(index, max) : index;
}
