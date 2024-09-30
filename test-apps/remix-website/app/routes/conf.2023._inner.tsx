import { Outlet } from "@remix-run/react";

export default function InnerLayout() {
  return (
    <div className="mt-24 py-8 md:py-12 xl:mt-32 xl:py-14">
      <div className="mx-auto px-6 sm:max-w-2xl md:max-w-3xl md:px-8 lg:max-w-4xl lg:px-10">
        <Outlet />
      </div>
    </div>
  );
}
