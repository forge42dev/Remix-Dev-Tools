import followRedirects from "follow-redirects";
import fs from "fs";
import path from "path";
import tar from "tar";
import invariant from "tiny-invariant";
import { env } from "~/env.server";

/**
 * Fetches a repo tarball from GitHub or your local repo as a tarball in
 * development.
 *
 * @param ref GitHub ref (main, v6.0.0, etc.) use "local" for local repo.
 * @returns The repo tarball
 */
export async function getRepoTarballStream(
  repo: string,
  ref: string,
): Promise<NodeJS.ReadableStream> {
  if (ref === "local") {
    console.log("Using local repo");
    return getLocalTarballStream();
  }

  let agent = new followRedirects.https.Agent({ keepAlive: true });
  let tarballURL = `https://github.com/${repo}/archive/${ref}.tar.gz`;
  let { hostname, pathname } = new URL(tarballURL);
  let options = { agent: agent, hostname: hostname, path: pathname };

  try {
    let res = await get(options);
    if (res.statusCode === 200) {
      return res;
    }
    throw new Error(`Could not fetch ${tarballURL}`);
  } catch (err) {
    throw new Error(`Could not fetch ${tarballURL}`);
  }
}

/**
 * Creates a tarball out of your local source repository so that the rest of the
 * code in this app can continue to work the same for local dev as in
 * production.
 */
export async function getLocalTarballStream(): Promise<NodeJS.ReadableStream> {
  invariant(
    env.LOCAL_REPO_RELATIVE_PATH,
    "LOCAL_REPO_RELATIVE_PATH is not set",
  );
  let localDocsPath = path.join(
    process.cwd(),
    env.LOCAL_REPO_RELATIVE_PATH,
    "docs",
  );
  await tar.c({ gzip: true, file: ".local.tgz" }, [localDocsPath]);
  return fs.createReadStream(".local.tgz");
}

// FIXME: I don't know the types here
function get(options: any): any {
  return new Promise((accept, reject) => {
    followRedirects.https.get(options, accept).on("error", reject);
  });
}
