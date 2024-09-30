import { createPortal } from "react-dom";
import type { DocSearchProps } from "@docsearch/react";
import { useDocSearchKeyboardEvents } from "@docsearch/react/dist/esm/useDocSearchKeyboardEvents";
import "@docsearch/css/dist/style.css";
import "~/styles/docsearch.css";
import { useHydrated } from "./primitives/utils";
import { Suspense, lazy, useCallback, useState } from "react";

const OriginalDocSearch = lazy(() =>
  import("@docsearch/react").then((module) => ({
    default: module.DocSearch,
  })),
);

let OriginalDocSearchModal = lazy(() =>
  import("@docsearch/react").then((module) => ({
    default: module.DocSearchModal,
  })),
);

let docSearchProps = {
  appId: "6OHWJSR8G4",
  indexName: "remix",
  apiKey: "dff56670dbec8494409989d6ec9c8ac2",
} satisfies DocSearchProps;

// TODO: Refactor a bit when we add Vite with css imports per component
// This will allow us to have two versions of the component, one that has
// the button with display: none, and the other with button styles
export function DocSearch() {
  let hydrated = useHydrated();

  if (!hydrated) {
    // The Algolia doc search container is hard-coded at 40px. It doesn't
    // render anything on the server, so we get a mis-match after hydration.
    // This placeholder prevents layout shift when the search appears.
    return <div className="h-10" />;
  }

  return (
    <Suspense fallback={<div className="h-10" />}>
      <div className="animate-[fadeIn_100ms_ease-in_1]">
        <OriginalDocSearch {...docSearchProps} />
      </div>
    </Suspense>
  );
}

/**
 * DocSearch but only the modal accessible by keyboard command
 * Intended for people instinctively pressing cmd+k on a non-doc page
 *
 * If you need a DocSearch button to appear, use the DocSearch component
 * Modified from https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/DocSearch.tsx
 */
export function DocSearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
  });

  if (isOpen) {
    return createPortal(
      <Suspense fallback={null}>
        <OriginalDocSearchModal
          initialScrollY={window.scrollY}
          onClose={onClose}
          {...docSearchProps}
        />
      </Suspense>,
      document.body,
    );
  }

  return null;
}
