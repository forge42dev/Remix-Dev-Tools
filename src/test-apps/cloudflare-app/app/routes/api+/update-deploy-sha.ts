import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = context.env as Env;
  try {
    const key = request.headers.get("Authorization");
    if (key !== `Bearer ${env.POST_API_KEY}`) {
      return new Response(`Unauthorized ${key}`, { status: 401 });
    }
    const data = await request.json();
    await env.CONTENT.put("$$deploy-sha", JSON.stringify(data));
    return json({ success: true });
  } catch (e) {
    //@ts-expect-error
    return json({ message: e.message, stack: e.stack });
  }
};
