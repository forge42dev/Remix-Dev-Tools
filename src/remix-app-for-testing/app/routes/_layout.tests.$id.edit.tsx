import type { ActionArgs } from "@remix-run/node";
import { json, redirect, type LoaderArgs } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/node";
import { measure } from "../../../index";
import {
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderArgs) =>
  measure(async ({ time }) => {
    await time(
      "test",
      async () => new Promise((resolve) => setTimeout(resolve, 1000))
    );
    return "raw string";
  });

export const action = async ({ request }: ActionArgs) => {
  return json({
    test: "died",
  });
};

export default function Index() {
  const data = new FormData();
  data.append("test", "test");
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Outlet />
    </div>
  );
}
