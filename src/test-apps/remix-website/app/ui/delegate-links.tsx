import * as React from "react";
import { PrefetchPageLinks, useNavigate } from "@remix-run/react";

function isLinkEvent(event: MouseEvent) {
  if (!(event.target instanceof HTMLElement)) return;
  let a = event.target.closest("a");
  return (
    a && // is anchor or has anchor parent
    !a.hasAttribute("data-noprefetch") && // didn't opt out
    a.hasAttribute("href") && // has an href
    a.host === window.location.host && // is internal
    a
  );
}

function useDelegatedReactRouterLinks(nodeRef: React.RefObject<HTMLElement>) {
  let navigate = useNavigate();

  React.useEffect(() => {
    let node = nodeRef.current;
    function handleClick(event: MouseEvent) {
      if (!node) return;
      let a = isLinkEvent(event);
      if (
        a &&
        event.button === 0 && // left click
        (!a.target || a.target === "_self") && // Let browser handle "target=_blank" etc.
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) // not modified
      ) {
        event.preventDefault();
        let { pathname, search, hash } = a;
        navigate({ pathname, search, hash });
      }
    }
    node?.addEventListener("click", handleClick);
    return () => {
      node?.removeEventListener("click", handleClick);
    };
  }, [navigate, nodeRef]);
}

function PrefetchMarkdownLinks({ children }: { children: React.ReactNode }) {
  let nodeRef = React.useRef<HTMLDivElement>(null);
  let [page, setPage] = React.useState<null | string>(null);

  React.useEffect(() => {
    let node = nodeRef.current;
    function handleMouseEnter(event: MouseEvent) {
      if (!nodeRef.current) return;
      let a = isLinkEvent(event);
      if (a) {
        let { pathname, search } = a;
        setPage(pathname + search);
      }
    }
    node?.addEventListener("mouseenter", handleMouseEnter, true);
    return () => {
      node?.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <div ref={nodeRef}>
      {children}
      {page && <PrefetchPageLinks page={page} />}
    </div>
  );
}

export { useDelegatedReactRouterLinks, PrefetchMarkdownLinks };
