import {
  data,
  Form,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { userSomething } from "./modules/user.server";


export const links = () => [];

export const loader = () => {
  userSomething();
  const mainPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const subPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("test");
        }, 2000);
      });
      resolve({ test: "test", subPromise});
    }, 2000);
  });
  return  data({ message: "Hello World", mainPromise }, { headers: { "Cache-Control": "max-age=3600, private" } });
}

export const action =async  () => {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("test");
    }, 2000);
  });
  return  ({ message: "Hello World" });
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