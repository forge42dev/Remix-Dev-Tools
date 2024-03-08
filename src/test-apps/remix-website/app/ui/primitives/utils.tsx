import {
  createContext as React_createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect as React_useLayoutEffect,
  useMemo,
  useState,
} from "react";

export const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export const useLayoutEffect = canUseDOM ? React_useLayoutEffect : useEffect;

let hydrating = true;
export function useHydrated() {
  let [hydrated, setHydrated] = useState(() => !hydrating);
  useEffect(() => {
    hydrating = false;
    setHydrated(true);
  }, []);
  return hydrated;
}

export function useForceUpdate() {
  let [, dispatch] = useState(() => Object.create(null));
  return useCallback(() => {
    dispatch(Object.create(null));
  }, []);
}

export function composeEventHandlers<
  EventType extends { defaultPrevented: boolean },
>(
  theirHandler: ((event: EventType) => any) | undefined,
  ourHandler: (event: EventType) => any,
): (event: EventType) => any {
  return (event) => {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      return ourHandler(event);
    }
  };
}

/**
 * React.Ref uses the readonly type `React.RefObject` instead of
 * `React.MutableRefObject`, We pretty much always assume ref objects are
 * mutable (at least when we create them), so this type is a workaround so some
 * of the weird mechanics of using refs with TS.
 */
export type AssignableRef<ValueType> =
  | {
      bivarianceHack(instance: ValueType | null): void;
    }["bivarianceHack"]
  | React.MutableRefObject<ValueType | null>;

/**
 * Passes or assigns an arbitrary value to a ref function or object.
 *
 * @param ref
 * @param value
 */
export function assignRef<RefValueType = any>(
  ref: AssignableRef<RefValueType> | null | undefined,
  value: any,
) {
  if (ref == null) return;
  if (isFunction(ref)) {
    ref(value);
  } else {
    try {
      ref.current = value;
    } catch (error) {
      throw new Error(`Cannot assign value "${value}" to ref "${ref}"`);
    }
  }
}

/**
 * Passes or assigns a value to multiple refs (typically a DOM node). Useful for
 * dealing with components that need an explicit ref for DOM calculations but
 * also forwards refs assigned by an app.
 *
 * @param refs Refs to fork
 */
export function useComposedRefs<RefValueType = any>(
  ...refs: (AssignableRef<RefValueType> | null | undefined)[]
) {
  return useCallback((node: any) => {
    for (let ref of refs) {
      assignRef(ref, node);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}

export function isBoolean(value: any): value is boolean {
  return typeof value === "boolean";
}

export function isNumber(value: any): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isFunction(value: any): value is Function {
  return typeof value === "function";
}

/**
 * Get an element's owner document. Useful when components are used in iframes
 * or other environments like dev tools.
 *
 * @param element
 */
export function getOwnerDocument<T extends Element>(
  element: T | null | undefined,
) {
  if (!canUseDOM) {
    throw new Error("`document` can only be accessed in a browser environment");
  }
  return element?.ownerDocument || document;
}

export function getOwnerWindow<T extends Element>(
  element: T | null | undefined,
) {
  let ownerDocument = getOwnerDocument(element);
  return ownerDocument.defaultView || window;
}

export function makeId(...args: (string | number | null | undefined)[]) {
  return args.filter((val) => val != null).join("--");
}

export function isAnchorElement(
  element: Node | EventTarget | null | undefined,
): element is HTMLAnchorElement {
  return !!(element && "tagName" in element && element?.tagName === "A");
}

export function isInputElement(
  element: Element | null | undefined,
): element is HTMLInputElement {
  return !!(element && "tagName" in element && element?.tagName === "INPUT");
}

export function isButtonElement(
  element: Element | null | undefined,
): element is HTMLButtonElement {
  return !!(element && "tagName" in element && element?.tagName === "BUTTON");
}

/**
 * Detects right clicks
 *
 * @param nativeEvent
 */
export function isRightClick(
  nativeEvent: MouseEvent | PointerEvent | TouchEvent,
) {
  return "which" in nativeEvent
    ? nativeEvent.which === 3
    : "button" in nativeEvent
      ? (nativeEvent as any).button === 2
      : false;
}

/**
 * Get computed style properties of a DOM element.
 *
 * @param element
 */
export function getComputedStyles(
  element: Element,
): CSSStyleDeclaration | null {
  let ownerWindow = getOwnerWindow(element);
  if (ownerWindow) {
    return ownerWindow.getComputedStyle(element, null);
  }
  return null;
}

/**
 * Get a computed style value by property.
 *
 * @param element
 * @param styleProp
 */
export function getComputedStyle(element: Element, styleProp: string) {
  return getComputedStyles(element)?.getPropertyValue(styleProp) || null;
}

type ContextProvider<T> = React.FC<React.PropsWithChildren<T>>;

export function createContext<ContextValueType extends object | null>(
  rootComponentName: string,
  defaultContext?: ContextValueType,
): [
  ContextProvider<ContextValueType>,
  (callerComponentName: string) => ContextValueType,
] {
  let Ctx = React_createContext<ContextValueType | undefined>(defaultContext);

  function Provider(props: React.PropsWithChildren<ContextValueType>) {
    let { children, ...context } = props;
    let value = useMemo(
      () => context,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(context),
    ) as ContextValueType;
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  function useValidatedContext(callerComponentName: string) {
    let context = useContext(Ctx);
    if (context) {
      return context;
    }
    if (defaultContext) {
      return defaultContext;
    }
    throw Error(
      `${callerComponentName} must be rendered inside of a ${rootComponentName} component.`,
    );
  }

  Ctx.displayName = `${rootComponentName}Context`;
  Provider.displayName = `${rootComponentName}Provider`;
  return [Provider, useValidatedContext];
}

export function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[ .':]/g, " ")
    .split(" ")
    .filter(Boolean)
    .join("-");
}
