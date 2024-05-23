 
import type { HeadersFunction, LinksFunction,  } from "@react-router/node";
import { useLoaderData, isRouteErrorResponse, useRouteError } from "react-router";
import type { ShouldRevalidateFunction } from "react-router";

export const links: LinksFunction = () => (
  [
    // your links here
  ]
);

 

export const handle = () => ({
  // your handler here
});

export const headers: HeadersFunction = () => (
  {
    // your headers here
  }
);
 

export default function RouteComponent(){
  const data = useLoaderData ()
  return (
    <div />
  );
}

export function ErrorBoundary(){
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <div/>
  }
  return <div/>
}

export const shouldRevalidate: ShouldRevalidateFunction = () => {
 return true;
};