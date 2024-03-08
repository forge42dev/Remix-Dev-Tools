import { LRUCache } from "lru-cache";
import type { Octokit } from "octokit";

type CacheContext = { octokit: Octokit };

declare global {
  var branchesCache: LRUCache<string, string[], CacheContext>;
}

export async function getBranches(repo: string, { octokit }: CacheContext) {
  return branchesCache.fetch(repo, {
    context: { octokit },
  });
}

global.branchesCache ??= new LRUCache<string, string[], CacheContext>({
  max: 3,
  ttl: 1000 * 60 * 5, // 5 minutes, so we can see new tags quickly
  allowStale: true,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchBranches,
});

async function fetchBranches(
  key: string,
  staleValue: string[] | undefined,
  { context }: LRUCache.FetchOptionsWithContext<string, string[], CacheContext>,
) {
  console.log("Fetching fresh branches", key);
  let [owner, repo] = key.split("/");
  let { data } = await context.octokit.rest.repos.listBranches({
    mediaType: { format: "json" },
    owner,
    repo,
    per_page: 100,
  });
  return data.map((branch: { name: string }) => branch.name);
}
