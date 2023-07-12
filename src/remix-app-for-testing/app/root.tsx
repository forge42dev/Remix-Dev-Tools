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
import RemixDevToolsStylesheet from "../../../src/RemixDevToolsStylesheet.css";
import { RemixDevTools } from "../../RemixDevTools/RemixDevTools";
import { measure } from "../../monitor";

export const links: LinksFunction = () => [
  ...(RemixDevToolsStylesheet
    ? [{ rel: "stylesheet", href: RemixDevToolsStylesheet }]
    : []),
];
export const loader = ({ request }: LoaderArgs) =>
  measure(async ({ time }) => {
    await time(
      "test",
      async () => new Promise((resolve) => setTimeout(resolve, 1000))
    );
    return json({
      message: "Hello root World!",
    });
  });

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
