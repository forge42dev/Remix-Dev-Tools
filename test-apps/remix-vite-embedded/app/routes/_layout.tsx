import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import {EmbeddedDevTools} from 'remix-development-tools/client'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return { test: "returning raw object" };
};

export default function App() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
