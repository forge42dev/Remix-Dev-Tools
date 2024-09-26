import type { HeadersFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { CACHE_CONTROL } from "~/lib/http.server";
import { DocSearchModal } from "~/ui/docsearch";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function ExtrasLayout() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <DocSearchModal />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
