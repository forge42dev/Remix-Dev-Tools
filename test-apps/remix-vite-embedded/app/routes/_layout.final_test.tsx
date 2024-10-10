import type { V2_MetaFunction } from "@remix-run/react/dist/routeModules";
import type { HeadersFunction, LinksFunction, LoaderArgs, ActionArgs } from "@remix-run/node";
import { useLoaderData, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import type { ShouldRevalidateFunction } from "@remix-run/react";

export const links: LinksFunction = () => (
  [
    // your links here
  ]
);

export const meta: V2_MetaFunction = () => [
  // your meta here
];

export const handle = () => ({
  // your handler here
});

export const headers: HeadersFunction = () => (
  {
    // your headers here
  }
);

export const loader = async ({ request }: LoaderArgs) => {
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  return null;
};

export default function RouteComponent(){
  const data = useLoaderData<typeof loader>()
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