 
import { LinksFunction, json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";   
import  { useRemixForgeSocket, withDevTools  } from "remix-development-tools";
import { cssBundleHref } from "@remix-run/css-bundle";
import rdtStyles from "remix-development-tools/index.css";
export const links: LinksFunction = () => {
  return [
    ...(cssBundleHref
      ? [{ rel: "stylesheet", href: cssBundleHref }]
      : []),
     ...(process.env.NODE_ENV === "development" ? [{rel: "stylesheet", href: rdtStyles }]: [])
  ];
};
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
    from: "me tooo"
  });
};

export const handle = {
  test: "test",
};

 
export const action = async () => {
  return json({ data: "returned yay" });
};

 function App() {
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
      </body>
    </html>
  );
} 
 
export default withDevTools(App);