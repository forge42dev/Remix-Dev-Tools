 
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"; 
import { Suspense, lazy } from "react";
import { useRemixForgeSocket } from "remix-development-tools";
const RemixDevTools = process.env.NODE_ENV === 'development' ? lazy(() => import("remix-development-tools")) : null
const Component = () => {
  const { isConnected, sendJsonMessage } = useRemixForgeSocket({
    onMessage: (message) => {
      console.log(message.data);
    },
  });
 /*  useEffect(() => {
    sendJsonMessage({
      subtype: "open_file",
      path: "app/root.tsx",
    });
    sendJsonMessage({
      subtype: "read_file",
      path: "app/root.tsx",
    });
    sendJsonMessage({
      subtype: "delete_file",
      path: "aspp/rosutes/login.tsx",
    });
  }, []); */
  return <div>Test</div>;
};
const plugin = () => {
  return {
    name: "Test",
    icon: <div>Test</div>,
    id: "test",
    requiresForge: false,
    component: <Component />,
  };
};
 


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
        {RemixDevTools ? (<Suspense><RemixDevTools /></Suspense>) : null}
        <LiveReload /> 
      </body>
    </html>
  );
}
