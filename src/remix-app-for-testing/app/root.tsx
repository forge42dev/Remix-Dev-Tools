import type { LoaderArgs } from "@remix-run/node";
import { json, type ActionArgs, type LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesheet from "../../../dist/stylesheet.css";
import { RemixDevTools } from "../../../dist";
/* 
import stylesheet from "../../public/stylesheet.css";
import { RemixDevTools } from "../../RemixDevTools/RemixDevTools";

import stylesheet from "../../public/stylesheet.css";
import { RemixDevTools } from "../../RemixDevTools/RemixDevTools";
 */
export const links: LinksFunction = () => [
  ...(stylesheet ? [{ rel: "stylesheet", href: stylesheet }] : []),
];
export const loader = ({ request }: LoaderArgs) => {
  return json({
    message: "Hello root World!",
  });
};

export const handle = {
  test: "test",
};

export const action = async ({ request }: ActionArgs) => {
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
        <RemixDevTools />
      </body>
    </html>
  );
}
