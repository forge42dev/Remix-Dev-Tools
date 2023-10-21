import { type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

interface Env {
  CONTENT: KVNamespace;
}

export async function loader({ context }: LoaderFunctionArgs) {
  let env = context.env as Env;
  const slugs = await env.CONTENT.list({
    prefix: "blog/"
  });
  const posts = await Promise.all(
    slugs.keys.map(async ({ name }) => {
      const data = await env.CONTENT.get(name, "json");
      const { frontmatter, html, readTime, slug } = data as any;
      return { frontmatter, html, readTime, slug };
    })
  );
  return typedjson(posts, {
    headers: {
      "cache-control": "max-age=3600000"
    }
  });
}

export default function BlogIndex() {
  const posts = useTypedLoaderData<typeof loader>();
  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={`/${post.slug}`}>{post.frontmatter.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
