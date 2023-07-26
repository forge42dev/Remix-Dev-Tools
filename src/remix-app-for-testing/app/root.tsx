import type { LoaderArgs } from "@remix-run/node";
import { json, type ActionArgs, type LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
  useRevalidator,
} from "@remix-run/react";
import { lazy, useEffect } from "react";
import rdtStylesheet from "remix-development-tools/stylesheet.css";

const RemixDevTools =
  process.env.NODE_ENV === "development"
    ? lazy(() => import("remix-development-tools"))
    : undefined;

export const links: LinksFunction = () => [
  ...(rdtStylesheet && process.env.NODE_ENV === "development" ? [{ rel: "stylesheet", href: rdtStylesheet }] : []),
];

export const loader = () => {
  return json({ 
    message: "Hello root World!",
  });
};

export const handle = {
  test: "test",
};

export const action = async () => {
  return json({ data: "returned yay" });
}; 

export default function App() {
  
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload /> 
        {RemixDevTools && <RemixDevTools additionalTabs={[{
          name: "Test",
          icon: <div>Test</div>,
          id: "test",
          component: <div>Test</div>,
          requiresForge: true,
        }]} defaultOpen showRouteBoundaries />}
      </body>
    </html>
  );
}
