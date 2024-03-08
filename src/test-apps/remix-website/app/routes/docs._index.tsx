import { redirect } from "@remix-run/node";

export async function loader() {
  return redirect("/docs/en/main", { status: 301 });
}
