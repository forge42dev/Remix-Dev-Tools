import type { LinksFunction } from "@remix-run/cloudflare";

import { cssBundleHref } from "@remix-run/css-bundle";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import rdtStylesheet from "remix-development-tools/index.css";

import iconHref from "~/components/icons/sprite.svg";

import styles from "./tailwind.css";

export const links: LinksFunction = () => [
  { as: "image", href: iconHref, rel: "preload", type: "image/svg+xml" },
  { href: "/fonts/noto-sans-jp/font.css", rel: "stylesheet" },
  { href: styles, rel: "stylesheet" },
  ...(process.env.NODE_ENV === "development"
    ? [{ href: rdtStylesheet, rel: "stylesheet" }]
    : []),
  ...(cssBundleHref ? [{ href: cssBundleHref, rel: "stylesheet" }] : [])
];

function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width,initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

let AppExport = App;

if (process.env.NODE_ENV === "development") {
  const { withDevTools } = await import("remix-development-tools");
  AppExport = withDevTools(AppExport);
}

export default AppExport;
