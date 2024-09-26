import yaml from "yaml";
import { LRUCache } from "lru-cache";
import { env } from "~/env.server";
import { processMarkdown } from "../md.server";
import resourcesYamlFileContents from "../../../data/resources.yaml?raw";
import { slugify } from "~/ui/primitives/utils";
import type { Octokit } from "octokit";
import type { ResourceYamlData } from "~/schemas/yaml-resource-schema";
import { yamlResourceSchema } from "~/schemas/yaml-resource-schema";

export type CacheContext = { octokit: Octokit };

const GITHUB_URL = "https://github.com";

export const fetchResourcesFromYaml = () => {
  return yamlResourceSchema.parse(yaml.parse(resourcesYamlFileContents));
};

let _resources = fetchResourcesFromYaml();

let starFormatter = new Intl.NumberFormat("en", { notation: "compact" });

type ResourceGitHubData = {
  description?: string;
  sponsorUrl?: string;
  stars: number;
  starsFormatted: string;
  tags: string[];
};

export type Resource = ResourceYamlData & ResourceGitHubData;

export type Category = "all" | ResourceYamlData["category"];

/**
 * Gets all of the resources, fetching and merging GitHub data for each one
 */
export async function getAllResources({ octokit }: CacheContext) {
  let resources: Resource[] = await Promise.all(
    _resources.map(async (resource) => {
      // This is cached, so should just be a simple lookup
      let gitHubData = await getResourceGitHubData(resource.repoUrl, {
        octokit,
      });
      if (!gitHubData) {
        throw new Error(`Could not find GitHub data for ${resource.repoUrl}`);
      }
      return { ...resource, ...gitHubData };
    }),
  );

  return resources.sort((a, b) => b.stars - a.stars);
}

/**
 * Replace relative links in the README with absolute links
 *
 * Works only with images
 *
 * @param inputString - The README string
 * @param repoUrl - The URL of the repository
 * @returns The README string with relative links replaced with absolute links
 *
 * @example
 * const input = `<img src="./relative">`;
 * const repoUrl = "https://my-repo";
 * const readme = replaceRelativeLinks(input, repoUrl);
 * console.log(readme); // <img src="https://my-repo/raw/main/relative">
 *
 */

export function replaceRelativeLinks(inputString: string, repoUrl: string) {
  // Regular expression to match <img ... src="./relative"
  const regex = /(<img(?:\s+\w+="[^"]*")*\s+)(src="\.\/*)/g;

  // Replace matched substrings with <img ... src="https://repoUrl/raw/main"
  const replacedString = inputString.replace(
    regex,
    `$1src="${repoUrl}/raw/main/`,
  );

  return replacedString;
}

/**
 * Get a single resource by slug, fetching and merging GitHub data and README contents
 */
export async function getResource(
  resourceSlug: string,
  { octokit }: CacheContext,
) {
  let resource = _resources.find(
    (resource) => slugify(resource.title) === resourceSlug,
  );

  if (!resource) return;

  let [gitHubData, readmeHtml] = await Promise.all([
    getResourceGitHubData(resource.repoUrl, { octokit }),
    getResourceReadme(resource.repoUrl, { octokit }),
  ]);

  if (!gitHubData || !readmeHtml) {
    throw new Error(`Could not find GitHub data for ${resource.repoUrl}`);
  }

  return {
    ...resource,
    ...gitHubData,
    readmeHtml,
  };
}

//#region LRUCache and fetchers for GitHub data and READMEs

declare global {
  var resourceReadmeCache: LRUCache<string, string, CacheContext>;
  var resourceGitHubDataCache: LRUCache<
    string,
    ResourceGitHubData,
    CacheContext
  >;
}

let NO_CACHE = env.NO_CACHE;

global.resourceReadmeCache ??= new LRUCache<string, string, CacheContext>({
  max: 300,
  ttl: NO_CACHE ? 1 : 1000 * 60 * 5, // 5 minutes
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchReadme,
});

async function fetchReadme(
  key: string,
  _staleValue: string | undefined,
  { context }: LRUCache.FetchOptionsWithContext<string, string, CacheContext>,
): Promise<string> {
  let [owner, repo] = key.split("/");
  let contents = await context.octokit.rest.repos.getReadme({
    owner,
    repo,
    mediaType: { format: "raw" },
  });

  // when using `format: raw` the data property is the file contents
  let md = contents.data as unknown;
  if (md == null || typeof md !== "string") {
    throw Error(`Could not find README in ${key}`);
  }
  let { html } = await processMarkdown(md);
  return replaceRelativeLinks(html, `${GITHUB_URL}/${key}`);
}

async function getResourceReadme(repoUrl: string, context: CacheContext) {
  let repo = repoUrl.replace(`${GITHUB_URL}/`, "");
  let doc = await resourceReadmeCache.fetch(repo, { context });

  return doc || undefined;
}

async function getSponsorUrl(owner: string) {
  let sponsorUrl = `${GITHUB_URL}/sponsors/${owner}`;

  try {
    let response = await fetch(sponsorUrl);
    return !response.redirected ? sponsorUrl : undefined;
  } catch (e) {
    console.error("Failed to fetch sponsor url for", owner);
    return undefined;
  }
}

async function getResourceGitHubData(
  repoUrl: string,
  { octokit }: CacheContext,
) {
  return resourceGitHubDataCache.fetch(repoUrl, {
    context: { octokit },
  });
}

global.resourceGitHubDataCache ??= new LRUCache<
  string,
  ResourceGitHubData,
  CacheContext
>({
  max: 300,
  ttl: NO_CACHE ? 1 : 1000 * 60 * 5, // 5 minutes
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchResourceGitHubData,
});

let ignoredTopics = new Set(["remix-stack", "remix-run", "remix"]);

async function fetchResourceGitHubData(
  repoUrl: string,
  staleValue: ResourceGitHubData | undefined,
  {
    context,
  }: LRUCache.FetchOptionsWithContext<string, ResourceGitHubData, CacheContext>,
): Promise<ResourceGitHubData> {
  let [owner, repo] = repoUrl.replace(`${GITHUB_URL}/`, "").split("/");

  let [{ data }, sponsorUrl] = await Promise.all([
    context.octokit.rest.repos.get({ owner, repo }),
    getSponsorUrl(owner),
  ]);

  let description = data.description ?? undefined;
  let stars = data.stargazers_count;
  let tags = (data.topics ?? []).filter((topic) => !ignoredTopics.has(topic));

  return {
    description,
    stars,
    starsFormatted: starFormatter.format(stars).toLowerCase(),
    tags,
    sponsorUrl,
  };
}

//#endregion
