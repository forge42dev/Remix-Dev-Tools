import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const data = (await env.CONTENT.get("$$content-sha", "json")) || {
    commit: { sha: "" }
  };
  return json(data);
};
