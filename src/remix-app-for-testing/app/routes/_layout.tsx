import type { LoaderArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { measure } from "../../../monitor";

export const loader = async ({ request }: LoaderArgs) =>
  measure(() => {
    return { test: "returning raw object" };
  });

export default function App() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
