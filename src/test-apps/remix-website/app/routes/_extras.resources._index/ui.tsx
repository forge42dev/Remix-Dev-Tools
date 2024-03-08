import type { Category, Resource } from "~/lib/resources.server";
import { InitCodeblock, ResourceTag, useCreateTagUrl } from "~/ui/resources";
import { Link, useSearchParams } from "@remix-run/react";
import cx from "clsx";
import iconsHref from "~/icons.svg";
import { slugify } from "~/ui/primitives/utils";

export let categories = ["all", "templates", "libraries"];

export function FeaturedResourcePoster({
  featuredResource,
}: {
  featuredResource: Resource;
}) {
  let {
    title,
    description,
    imgSrc,
    repoUrl,
    starsFormatted,
    initCommand,
    sponsorUrl,
    tags,
  } = featuredResource;
  let createTagUrl = useCreateTagUrl();

  return (
    <>
      <ResourcePoster
        className="lg:col-span-2"
        to={slugify(title)}
        imgSrc={imgSrc}
        repoUrl={repoUrl}
        starsFormatted={starsFormatted}
        initCommand={initCommand}
        sponsorUrl={sponsorUrl}
      />
      <div className="-mt-6 flex flex-col md:mt-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 lg:text-3xl">
          <span className="block text-sm font-normal uppercase tracking-tight text-gray-500 dark:text-gray-300 md:text-lg">
            Featured
          </span>
          <span className="mt-4 block">{title}</span>
        </h2>
        <p className="mt-2 text-justify text-sm italic text-gray-500 dark:text-gray-300 lg:text-base">
          {description}
        </p>
        <div className="mt-4 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2">
          {tags.map((tag) => (
            <ResourceTag key={tag} to={createTagUrl({ add: tag })}>
              {tag}
            </ResourceTag>
          ))}
        </div>
      </div>
    </>
  );
}

export function ResourceCategoryTabs({
  selectedCategory,
}: {
  selectedCategory: Category;
}) {
  let [searchParams] = useSearchParams();

  let tabs = categories.map((category) => {
    let newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("category", category);

    return {
      name: category,
      href: `?${newSearchParams.toString()}`,
      current: category === selectedCategory,
    };
  });

  return (
    <div className="col-span-full">
      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                to={tab.href}
                className={cx(
                  tab.current
                    ? "border-blue-brand text-blue-600 dark:border-gray-200 dark:text-gray-300"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium capitalize",
                )}
                aria-current={tab.current ? "page" : undefined}
                preventScrollReset
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

type ResourceCardsProps = {
  resources: Resource[];
  selectedCategory: string;
  selectedTags: string[];
};
export function ResourceCards({
  resources,
  selectedCategory,
  selectedTags,
}: ResourceCardsProps) {
  let createTagUrl = useCreateTagUrl();
  let selectedTagsSet = new Set(selectedTags);

  if (resources.length > 0) {
    return resources.map(({ title, description, tags, ...props }) => (
      <div key={title} className="text-sm">
        <ResourcePoster to={`/resources/${slugify(title)}`} {...props} />
        <h2 className="mt-4 font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 italic text-gray-500 dark:text-gray-300">
            {description}
          </p>
        ) : null}
        <div className="mt-4 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2">
          {tags.map((tag) => (
            <ResourceTag
              key={tag}
              to={
                selectedTagsSet.has(tag)
                  ? createTagUrl({ remove: tag })
                  : createTagUrl({ add: tag })
              }
              selected={selectedTagsSet.has(tag)}
            >
              {tag}
            </ResourceTag>
          ))}
        </div>
      </div>
    ));
  }

  return (
    <p className="col-span-full text-lg text-gray-400 md:text-2xl">
      No{" "}
      <span className="capitalize">
        {selectedCategory === "all" ? "resources" : selectedCategory}
      </span>{" "}
      found with this combination of tags.{" "}
      <span className="md:mt-4 md:block">Try removing some of the tags.</span>
    </p>
  );
}

type ResourcePosterProps = Pick<
  Resource,
  "imgSrc" | "repoUrl" | "starsFormatted" | "initCommand" | "sponsorUrl"
> & {
  /** make the poster a link */
  to?: string;
  className?: string;
};

function ResourcePoster({
  to,
  imgSrc,
  repoUrl,
  starsFormatted,
  initCommand,
  sponsorUrl,
  className,
}: ResourcePosterProps) {
  let img = (
    <img
      src={imgSrc}
      alt=""
      className={cx(
        "h-full w-full rounded-t-lg border border-b-0 border-gray-100 object-cover object-center dark:border-gray-800",
        to &&
          "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:-outline-offset-4 group-focus-visible:outline-blue-brand",
      )}
    />
  );

  return (
    <div className={className}>
      <div className="relative">
        <div
          className={cx(
            "aspect-h-1 aspect-w-2 relative w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-900",
            to && "hover:opacity-90",
          )}
        >
          {to ? (
            <Link className="group" to={to}>
              {img}
            </Link>
          ) : (
            img
          )}
        </div>
        <GitHubLinks
          repoUrl={repoUrl}
          starsFormatted={starsFormatted}
          sponsorUrl={sponsorUrl}
        />
      </div>
      <InitCodeblock initCommand={initCommand} rounded="bottom" />
    </div>
  );
}

function GitHubLinks({
  repoUrl,
  starsFormatted,
  sponsorUrl,
}: Pick<Resource, "repoUrl" | "starsFormatted" | "sponsorUrl">) {
  return (
    <div className="absolute right-2 top-2 rounded-md bg-gray-50/70 text-xs text-gray-900 ring-1 ring-inset ring-gray-500/10 backdrop-blur-sm">
      <a
        href={repoUrl}
        rel="noopener noreferrer"
        target="_blank"
        className={cx(
          "flex w-full items-center justify-center gap-2 p-2 transition-colors hover:bg-gray-500/50",
          // Gotta git rid of the rounding on the bottom if there's another element
          sponsorUrl ? "rounded-t" : "rounded",
        )}
      >
        <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24">
          <use href={`${iconsHref}#github`} />
        </svg>
        <span>
          <span className="font-medium">Star</span>{" "}
          <span className="font-light">{starsFormatted}</span>
        </span>
      </a>

      {sponsorUrl ? (
        <a
          href={sponsorUrl}
          rel="noopener noreferrer"
          target="_blank"
          className="flex w-full items-center justify-center gap-2 rounded-b p-2 transition-colors hover:bg-gray-500/50"
        >
          <svg aria-hidden className="h-4 w-4" viewBox="0 0 16 16">
            <use href={`${iconsHref}#heart-filled`} />
          </svg>
          <span className="font-medium">Sponsor</span>
        </a>
      ) : null}
    </div>
  );
}
