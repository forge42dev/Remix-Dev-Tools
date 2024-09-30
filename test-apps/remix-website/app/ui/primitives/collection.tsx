import * as React from "react";
import { isNumber, useForceUpdate, useLayoutEffect } from "./utils";

const noop = () => {};

function createCollectionContext<
  Elem extends FocusableElement = FocusableElement,
  T extends CollectionItem<Elem> = CollectionItem<Elem>,
>(name: string, initialValue = {}) {
  type TT = CollectionContextValue<Elem, T>;
  let collectionItems: T[] = [];
  let ctx = React.createContext<TT>({
    collectionItems: collectionItems,
    registerItem: () => noop,
    ...initialValue,
  });
  ctx.displayName = name;
  return ctx;
}

/**
 * This hook registers our collection item by passing it into an array. We can
 * then search that array by to find its index when registering it in the
 * component. We use this for focus management, keyboard navigation, and
 * typeahead functionality for some components.
 *
 * The hook accepts the element node and (optionally) a key. The key is useful
 * if multiple collection items have identical text values and we need to
 * differentiate siblings for some reason.
 *
 * Our main goals with this are:
 *   1) maximum composability,
 *   2) minimal API friction
 *   3) SSR compatibility*
 *   4) concurrent safe
 *   5) index always up-to-date with the tree despite changes
 *   6) works with memoization of any component in the tree (hopefully)
 *
 * As for SSR, the good news is that we don't actually need the index on the
 * server for most use-cases, as we are only using it to determine the order of
 * composed items for keyboard navigation. However, in the few cases where this
 * is not the case, we can require an explicit index from the app.
 */
function useCollectionItem<
  Elem extends FocusableElement = FocusableElement,
  ItemType extends CollectionItem<Elem> = CollectionItem<Elem>,
>(
  item: ItemType,
  context: React.Context<CollectionContextValue<Elem, ItemType>>,
) {
  let forceUpdate = useForceUpdate();
  let { registerItem } = React.useContext(context);
  useLayoutEffect(() => {
    if (!item.element) forceUpdate();
    return registerItem(item);
  }, [
    item,
    forceUpdate,
    registerItem,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(item),
  ]);
}

function useCollectionInit<ItemType extends CollectionItem>() {
  return React.useState<ItemType[]>([]);
}

function useCollection<
  Elem extends FocusableElement = FocusableElement,
  ItemType extends CollectionItem<Elem> = CollectionItem<Elem>,
>(ctx: React.Context<CollectionContextValue<Elem, ItemType>>) {
  return React.useContext(ctx).collectionItems;
}

function CollectionProvider<
  Elem extends FocusableElement = FocusableElement,
  ItemType extends CollectionItem<Elem> = CollectionItem<Elem>,
>({
  context: Ctx,
  children,
  items: collectionItems,
  set,
}: {
  context: React.Context<CollectionContextValue<Elem, ItemType>>;
  children: React.ReactNode;
  items: ItemType[];
  set: React.Dispatch<React.SetStateAction<ItemType[]>>;
}) {
  let registerItem = React.useCallback(
    ({ element, index, ...rest }: ItemType) => {
      set((items) => {
        if (!isNumber(index) || !Number.isInteger(index) || index < 0) {
          throw new Error("The `index` property must be a positive integer.");
        }
        return insertAt(items, { element, index, ...rest } as ItemType, index);
      });

      return function unregisterCollectionItem() {
        if (!element) return;
        set((items) => items.filter((item) => element !== item.element));
      };
    },
    [set],
  );

  return (
    <Ctx.Provider
      value={React.useMemo(() => {
        return { collectionItems, registerItem };
      }, [collectionItems, registerItem])}
    >
      {children}
    </Ctx.Provider>
  );
}

/**
 * Copy an array of items with a new item added at a specific index.
 * @param array The source array
 * @param item The item to insert into the array
 * @param index The index to insert the item at
 * @returns A copy of the array with the item inserted at the specified index
 */
function insertAt<T extends any[]>(
  array: T,
  item: T[number],
  index?: number,
): T {
  if (index == null || !(index in array)) {
    return [...array, item] as T;
  }
  return [...array.slice(0, index), item, ...array.slice(index)] as T;
}

interface CollectionItem<Elem = FocusableElement> {
  element: Elem | null;
  index: number;
}

interface CollectionContextValue<
  Elem extends FocusableElement = FocusableElement,
  T extends CollectionItem<Elem> = CollectionItem<Elem>,
> {
  collectionItems: T[];
  registerItem(item: T): UnregisterCollectionItem;
}

type UnregisterCollectionItem = () => void;

type FocusableElement = HTMLElement | SVGElement;

export type {
  CollectionItem,
  CollectionContextValue,
  UnregisterCollectionItem,
};
export {
  createCollectionContext,
  CollectionProvider,
  useCollectionItem,
  useCollection,
  useCollectionInit,
};
