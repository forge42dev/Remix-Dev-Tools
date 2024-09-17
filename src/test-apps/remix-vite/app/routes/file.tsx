import { Outlet } from "@remix-run/react";

export default function File() {
  return (
    <div>
      <h2>File Route</h2>
      <Outlet />
    </div>
  );
}
