/**
 * Any marketing pages that should be forced into dark mode can be added as child
 * routes to `routes/_marketing` and they'll automatically be dark mode, don't
 * use any `dark:` variants, just style the pages with the colors in the
 * designs.
 */
import { Outlet } from "@remix-run/react";

import { Header } from "~/ui/header";
import { Footer } from "~/ui/footer";
import { DocSearchModal } from "~/ui/docsearch";

export const handle = { forceDark: true };

export default function Marketing() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <Header forceDark={true} />
      <main className="flex flex-1 flex-col" tabIndex={-1}>
        <DocSearchModal />
        <Outlet />
      </main>
      <Footer forceDark={true} />
    </div>
  );
}
