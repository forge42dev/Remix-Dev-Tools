import fsp from "fs/promises";
import path from "path";
import invariant from "tiny-invariant";
import { env } from "~/env.server";

/**
 * Fetches the contents of a file in a repository or from your local disk.
 *
 * @param ref The GitHub ref, use `"local"` for local docs development
 * @param filepath The filepath inside the repo (including "docs/")
 * @returns The text of the file
 */
export async function getRepoContent(
  repoPair: string,
  ref: string,
  filepath: string,
): Promise<string | null> {
  if (ref === "local") return getLocalContent(filepath);
  let [owner, repo] = repoPair.split("/");
  let pathname = `/${owner}/${repo}/${ref}/${filepath}`;
  let response = await fetch(
    new URL(pathname, "https://raw.githubusercontent.com/").href,
    { headers: { "User-Agent": `docs:${owner}/${repo}` } },
  );
  if (!response.ok) return null;
  return response.text();
}

/**
 * Reads a single file from your local source repository
 */
async function getLocalContent(filepath: string): Promise<string> {
  invariant(
    env.LOCAL_REPO_RELATIVE_PATH,
    "LOCAL_REPO_RELATIVE_PATH is not set",
  );
  let localFilePath = path.join(env.LOCAL_REPO_RELATIVE_PATH, filepath);
  let content = await fsp.readFile(localFilePath);
  return content.toString();
}
