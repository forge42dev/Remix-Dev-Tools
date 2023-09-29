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
          really: {
            deep: "inside",
            array: [
              "this",
              "is",
              "a",
              "really",
              "long",
              "array",
              "that",
              "should",
              "be",
              "truncated",
            ],
          },
        },
      },
    },
  }, { headers: { "Cache-Control": "max-age=60, s-maxage=6000" } });
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
      <h1>Welcome to Remix 3</h1>
       <Outlet />
      <Link to="/login">Login</Link>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return null;
};