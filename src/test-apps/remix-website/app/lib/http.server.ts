import { redirect } from "@remix-run/node";
import redirectsFileContents from "../../_redirects?raw";

export const CACHE_CONTROL = {
  /**
   * Add 5 minutes cache control to documents and json requests to speed up the
   * back button
   */
  DEFAULT: "max-age=300",
  /**
   * Keep it in the browser (and CDN) for 5 minutes so when they click
   * back/forward/etc. it's super fast. SWR for 1 week on CDN so it stays fast,
   * but people get typos/fixes and stuff too.
   */
  doc: "max-age=300, stale-while-revalidate=604800",
  /**
   * Keep it in the browser (and CDN) for 1 day, we won't be updating these as
   * often until the conf is a bit closer, and we can prevent over-fetching from
   * Sessionize which is pretty slow.
   */
  conf: `max-age=${60 * 60 * 24}`,
};

export function requirePost(request: Request) {
  if (request.method.toLowerCase() !== "post") {
    throw new Response("", {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }
}

// relative to where we're built, build/index.js
type Redirect = [string, string, number?];
let redirects: null | Redirect[] = null;

// TODO: add support with pathToRegexp to redirect with * and stuff
export function handleRedirects(pathname: string) {
  if (redirects === null) {
    redirects = [];

    for (let line of redirectsFileContents.split("\n")) {
      line = line.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }
      let [from, to, maybeCode] = line.split(/\s+/);
      redirects.push([from, to, getValidRedirectCode(maybeCode)]);
    }
  }

  let foundRedirect = redirects.find(([from]) => pathname === from);
  if (foundRedirect) {
    throw redirect(foundRedirect[1], { status: foundRedirect[2] });
  }

  return null;
}

export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  init?: number | ResponseInit,
) {
  if (
    !to ||
    typeof to !== "string" ||
    !to.startsWith("/") ||
    to.startsWith("//")
  ) {
    to = "/";
  }
  return redirect(to, init);
}

export function removeTrailingSlashes(request: Request) {
  let url = new URL(request.url);
  if (url.pathname.endsWith("/") && url.pathname !== "/") {
    throw redirect(url.pathname.slice(0, -1) + url.search);
  }
}

export function isProductionHost(request: Request) {
  return "remix.run" === request.headers.get("host");
}

function getValidRedirectCode(code: string | number | undefined) {
  let defaultCode = 302;
  if (!code) return defaultCode;
  if (typeof code === "string") {
    try {
      code = parseInt(code.trim(), 10);
    } catch (_) {
      return defaultCode;
    }
  }
  if (!Number.isInteger(code) || code < 300 || code >= 400) {
    return defaultCode;
  }
  return code;
}
