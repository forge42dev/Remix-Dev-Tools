/// <reference types="vite/client" />
/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />
/// <reference types="@remix-run/react" />

declare module "@remix-run/router" {
  interface Path extends Path {
    // @ts-ignore
    pathname: Routes;
  }
  type To = Routes | Partial<Path>;
  type RedirectFunction = (url: Routes, init?: number | ResponseInit) => TypedResponse<never>;
}

declare module "@remix-run/server-runtime" {
  type RedirectFunction = (url: Routes, init?: number | ResponseInit) => TypedResponse<never>;
}
declare module "@remix-run/node" {
  type RedirectFunction = (url: Routes, init?: number | ResponseInit) => TypedResponse<never>;
}
