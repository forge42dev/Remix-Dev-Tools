
import { LoaderFunctionArgs, useLoaderData } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return null;
};

export default function RouteComponent(){
  const data = useLoaderData<typeof loader>()
  return (
    <div />
  );
}