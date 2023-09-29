import type { ActionArgs } from "@remix-run/node";
import { json, type LoaderArgs } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/node";
import { Link, Outlet, useFetcher, useLoaderData, useSubmit } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderArgs) => {
  return json({
    should: "work",
    with: {
      nested: {
        objects: {
           
        },
      },
    },
  }, { headers: { "Cache-Control": "max-age=3600, private" } });
};

export const action = async ({ request }: ActionArgs) => {
  return new Response(JSON.stringify({ test: "died" }));
};

export default function IndexRoute() {
  const string = useLoaderData<typeof loader>();
  const lFetcher = useFetcher();
  const lFetcher2 = useFetcher();
  const pFetcher = useFetcher();
  const submit = useSubmit();
  const data = new FormData();
  data.append("test", "test");
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix 4</h1>
        <Outlet />
    </div>
  );
}
