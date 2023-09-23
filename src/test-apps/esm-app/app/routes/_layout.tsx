import type { LoaderArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const loader = async ({ request }: LoaderArgs) => {
  return { test: "returning raw object" };
};

export default function App() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
