import type { MetaDescriptor } from "@remix-run/node";

type CustomMetaArgs = {
  title: string;
  description: string;
  siteUrl?: string;
  image?: string;
} & { additionalMeta?: MetaDescriptor[] };

export const getMeta = ({
  title,
  description,
  siteUrl,
  image,
  additionalMeta,
}: CustomMetaArgs) => {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:url", content: siteUrl },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:creator", content: "@remix_run" },
    { name: "twitter:site", content: "@remix_run" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    ...(additionalMeta ?? []),
  ].filter((v) => {
    if ("content" in v) {
      return !!v.content;
    }
    return true;
  });
};
