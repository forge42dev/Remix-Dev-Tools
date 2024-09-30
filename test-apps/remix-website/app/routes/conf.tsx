import { Outlet } from "@remix-run/react";
import type { HeadersFunction } from "@remix-run/node";
import { CACHE_CONTROL } from "~/lib/http.server";

export const handle = { forceDark: true };

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.conf,
  };
};

export default function Conf() {
  return <Outlet />;
}
