/**
 * Welcome to @reach/portal!
 *
 * Creates and appends a DOM node to the end of `document.body` and renders a
 * React tree into it. Useful for rendering a natural React element hierarchy
 * with a different DOM hierarchy to prevent parent styles from clipping or
 * hiding content (for popovers, dropdowns, and modals).
 *
 * @see Docs   TODO
 * @see Source TODO
 * @see React  https://reactjs.org/docs/portals.html
 */

import * as React from "react";
import { createPortal } from "react-dom";
import {
  getOwnerDocument,
  useForceUpdate,
  useHydrated,
  useLayoutEffect,
} from "./utils";

const PortalImpl: React.FC<PortalProps> = ({
  children,
  type = "reach-portal",
  containerRef,
}) => {
  let mountNode = React.useRef<HTMLSpanElement | null>(null);
  let portalNode = React.useRef<HTMLElement | null>(null);
  let forceUpdate = useForceUpdate();

  useLayoutEffect(() => {
    let ownerDocument = getOwnerDocument(mountNode.current);
    let container = containerRef?.current || ownerDocument.body;
    let child = ownerDocument.createElement(type);
    container.appendChild((portalNode.current = child));
    forceUpdate();
    return () => {
      container.removeChild(child);
    };
  }, [type, forceUpdate, containerRef]);

  return portalNode.current ? (
    createPortal(children, portalNode.current)
  ) : (
    <span ref={mountNode} />
  );
};

/**
 * Creates and appends a DOM node to the end of `document.body` and renders a
 * React tree into it. Useful for rendering a natural React element hierarchy
 * with a different DOM hierarchy to prevent parent styles from clipping or
 * hiding content (for popovers, dropdowns, and modals).
 *
 * @see Docs https://TODO.com/portal#portal
 */
const Portal: React.FC<PortalProps> = ({
  unstable_skipRenderBeforeHydration,
  ...props
}) => {
  let hydrated = useHydrated();
  if (unstable_skipRenderBeforeHydration && !hydrated) {
    return null;
  }
  return <PortalImpl {...props} />;
};

/**
 * @see Docs https://TODO.com/portal#portal-props
 */
interface PortalProps {
  /**
   * Regular React children.
   *
   * @see Docs https://TODO.com/portal#portal-children
   */
  children: React.ReactNode;
  /**
   * The DOM element type to render.
   *
   * @see Docs https://TODO.com/portal#portal-type
   */
  type?: string;
  /**
   * The container ref to which the portal will be appended. If not set the
   * portal will be appended to the body of the component's owner document
   * (typically this is the `document.body`).
   *
   * @see Docs https://TODO.com/portal#portal-containerRef
   */
  containerRef?: React.RefObject<Node>;
  unstable_skipRenderBeforeHydration?: boolean;
}

Portal.displayName = "Portal";

export type { PortalProps };
export { Portal };
