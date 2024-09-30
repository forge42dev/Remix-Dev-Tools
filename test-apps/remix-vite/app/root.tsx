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
import { userSomething } from "./modules/user.server";


export function links()  {
  return  []
}

export const loader = () => {
  console.log("loader?")
  userSomething();
  return  ({ message: "Hello World" });
}

export const action = () => {
  return json({ message: "Hello World" });
}

export default function App() {
  console.log("App?")
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
        <input readOnly type="text" name="name" value={"name"} />
       <button type="submit">
          Submit
        </button>
       </Form>
        <Outlet />
        <ScrollRestoration />
        <Scripts />

      </body>
    </html>
  );
}
