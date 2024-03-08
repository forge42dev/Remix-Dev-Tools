import { env } from "~/env.server";

export async function subscribeToNewsletter(email: string) {
  let TOKEN = env.CONVERTKIT_KEY;
  let URL = "https://api.convertkit.com/v3";
  let FORM_ID = "1334747";

  let res = await fetch(`${URL}/forms/${FORM_ID}/subscribe`, {
    method: "POST",
    body: JSON.stringify({ api_key: TOKEN, email }),
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

  let data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
}
