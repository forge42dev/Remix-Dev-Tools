import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { subscribeToNewsletter } from "~/lib/convertkit";
import { requirePost } from "~/lib/http.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  requirePost(request);

  let body = new URLSearchParams(await request.text());
  let email = body.get("email");
  if (typeof email !== "string" || email.indexOf("@") === -1) {
    return json({ error: "Invalid Email", ok: false }, { status: 400 });
  }

  try {
    await subscribeToNewsletter(email);
  } catch (e: any) {
    return json({ error: e.message || "Unknown error", ok: false });
  }

  return json({ error: null, ok: true });
};
