import { Outlet } from "@remix-run/react";

export default function OtherLayout() {
    return <div>
        <h2>Other Layout</h2>
        <Outlet />
    </div>
}