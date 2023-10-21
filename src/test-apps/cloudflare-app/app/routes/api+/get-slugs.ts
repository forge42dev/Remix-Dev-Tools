import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const slugs = await env.CONTENT.list({ prefix: "blog/" });
  const posts = await Promise.all(
    slugs.keys.map(async ({ name }: any) => {
      const data = await env.CONTENT.get(name, "json");
      const { frontmatter, slug /*, html*/ } = data as any;
      return { frontmatter, slug };
    })
  );
  return json(posts);
};
