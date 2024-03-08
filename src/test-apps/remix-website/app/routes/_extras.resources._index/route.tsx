import {
  json,
  type LoaderFunctionArgs,
  type HeadersFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ResourceTag, useCreateTagUrl } from "~/ui/resources";
import { getResourcesForRequest } from "./data.server";
import { CACHE_CONTROL } from "~/lib/http.server";
import {
  FeaturedResourcePoster,
  ResourceCards,
  ResourceCategoryTabs,
} from "./ui";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;
  let data = await getResourcesForRequest(request);

  return json(
    { ...data, siteUrl },
    { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } },
  );
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return loaderHeaders;
};

export const meta: MetaFunction<typeof loader> = (args) => {
  let { siteUrl } = args.data || {};
  let title = "Remix Resources";
  let image = siteUrl ? `${siteUrl}/img/og.1.jpg` : null;
  let description = "Remix Resources made by the community, for the community";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:url", content: `${siteUrl}/showcase` },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:creator", content: "@remix_run" },
    { name: "twitter:site", content: "@remix_run" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

export default function Resources() {
  let { featuredResource, selectedCategory, selectedTags, resources } =
    useLoaderData<typeof loader>();
  let createTagUrl = useCreateTagUrl();

  return (
    <main className="container flex flex-1 flex-col items-center md:mt-8">
      {featuredResource ? (
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            Remix Resources
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-light">
            Made by the community, for the community
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-2 self-start md:flex-row md:gap-4">
          <h1 className="min-w-fit self-start text-2xl font-bold md:text-4xl md:font-normal">
            Resources that use
          </h1>
          <div className="mt-2 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2 lg:mt-2">
            {selectedTags.map((tag) => (
              <ResourceTag
                key={tag}
                to={createTagUrl({ remove: tag })}
                selected
              >
                {tag}
              </ResourceTag>
            ))}
          </div>
        </div>
      )}

      <div
        className={
          "mt-8 grid min-w-full grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-x-8"
        }
      >
        {featuredResource ? (
          <FeaturedResourcePoster featuredResource={featuredResource} />
        ) : null}

        <ResourceCategoryTabs selectedCategory={selectedCategory} />

        <ResourceCards
          resources={resources}
          selectedCategory={selectedCategory}
          selectedTags={selectedTags}
        />
      </div>
    </main>
  );
}
