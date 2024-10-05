import type { LoaderFunctionArgs } from "@react-router/node";
import { Outlet } from "react-router";

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
