import { Outlet } from "@remix-run/react";

export default function Folder() {
    return <div>
        <h2>Folder Route</h2>
        <Outlet />
    </div>
}