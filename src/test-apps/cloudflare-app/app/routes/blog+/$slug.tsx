import { type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getParams } from "remix-params-helper";
import {
  type TypedMetaFunction,
  typedjson,
  useTypedLoaderData
} from "remix-typedjson";
import z from "zod";

const ParamsSchema = z.object({
  slug: z.string()
});

type Frontmatter = {
  [key: string]: any;
};

type BlogContentType = {
  code: string;
  frontmatter: Frontmatter;
  hash: string;
  html: string;
  readTime: any;
  slug: string;
};

export async function loader({ context, params }: LoaderFunctionArgs) {
  const result = getParams(params, ParamsSchema);
  if (!result.success) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }
  const slug = result.data.slug;
  const env = context.env as Env;

  const data = await env.CONTENT.get<BlogContentType>(`blog/${slug}`, "json");
  if (!data) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  console.log({ frontmatter: JSON.stringify(data.frontmatter) });

  return typedjson(
    { ...data, slug },
    { headers: { "cache-control": "max-age=3600000" } }
  );
}

export const meta: TypedMetaFunction<typeof loader> = ({ data }) => {
  let title = "ItsAydrian Blog";
  let description = "";
  if (data) {
    title = `${data.frontmatter.title} - ${title}`;
    description = data.frontmatter.description;
  }
  return [
    { title },
    {
      content: description,
      name: "description"
    },
    {
      content: title,
      property: "og:title"
    },
    {
      content: description,
      property: "og:description"
    },
    {
      content: "website",
      property: "og:type"
    },
    {
      content: "https://itsaydrian.com",
      property: "og:url"
    },
    // {
    //   content: "https://itsaydrian.com/og-image.png",
    //   property: "og:image"
    // },
    {
      content: "summary_large_image",
      name: "twitter:card"
    },
    {
      content: "@itsaydrian",
      name: "twitter:creator"
    },
    {
      content: title,
      name: "twitter:title"
    },
    {
      content: description,
      name: "twitter:description"
    }
  ];
};

export default function BlogSlug() {
  const { frontmatter, html, readTime } = useTypedLoaderData<typeof loader>();
  return (
    <div>
      <h1>{frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <div>{readTime?.text}</div>
    </div>
  );
}
