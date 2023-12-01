import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { LinksFunction, json } from "@remix-run/server-runtime";


export const links: LinksFunction = () => []

export const loader = () => {
  return json({ message: "Hello World" });
}

export const action = () => {
  return json({ message: "Hello World" });
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
       <Form method="post">
        
       <button type="submit">  
          Submit
        </button>
       </Form>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
