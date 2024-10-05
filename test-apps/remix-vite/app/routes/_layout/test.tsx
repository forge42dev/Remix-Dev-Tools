import type { LoaderArgs } from "@react-router/node";
import { useLoaderData } from "react-router";

export const loader = async ({ request }: LoaderArgs) => {
  return null;
};

export default function RouteComponent(){
  const data = useLoaderData<typeof loader>()
  return (
    <div />
  );
}