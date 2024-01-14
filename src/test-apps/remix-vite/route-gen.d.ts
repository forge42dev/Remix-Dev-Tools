import { TypedResponse } from "@remix-run/node";
import { Routes } from "./node_modules/route-names";
import type { To, Path } from "@remix-run/router";

declare module "@remix-run/router" {
  interface Path extends Path {
    // @ts-ignore
    pathname: Routes;
  }
  type To = Routes | Partial<Path>;
}
declare module "react-router" {
  interface Path extends Path {
    // @ts-ignore
    pathname: Routes;
  }
  type To = Routes | Partial<Path>;
}

declare module "@remix-run/server-runtime" {
  type RedirectFunction = (url: Routes, init?: number | ResponseInit) => TypedResponse<never>;
}
export {}