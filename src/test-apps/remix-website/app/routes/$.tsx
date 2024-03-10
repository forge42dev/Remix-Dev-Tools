import { handleRedirects } from "~/lib/http.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { getRepoDoc } from "~/lib/gh-docs";

// We use the catch-all route to attempt to find a doc for the given path. If a
// doc isn't found, we return a 404 as expected. However we also log those
// errors to get a good idea of what weird paths are requested often to identify
// a block-list for bots and malicious actors.
//
// We can skip all of that if a request is made for a static file, which we know
// doesn't exist by the time we get to the catch all route as our request
// handler will hit the public directory first. It'll skip the logging and save
// us an unncessary DB query.
const SAFE_STATIC_FILE_EXTENSIONS = [
  ".html",
  ".css",
  ".js",
  ".txt",
  ".json",
  ".ico",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".otf",
  ".mp4",
  ".webm",
  ".ogg",
  ".mp3",
  ".wav",
  ".flac",
  ".aac",
  ".m4a",
  ".mov",
];

function handleStaticFileRequests(param: string | undefined) {
  if (
    SAFE_STATIC_FILE_EXTENSIONS.some((ext) => !!(param && param.endsWith(ext)))
  ) {
    throw json({}, { status: 404 });
  }
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  handleRedirects(new URL(request.url).pathname);
  handleStaticFileRequests(params["*"]);

  try {
    let ref = "main";
    let lang = "en";
    let doc = await getRepoDoc(ref, `docs/${params["*"]}`);
    if (!doc) throw null;
    // FIXME: This results in two fetches, as the loader for the docs page will
    // repeat the request cycle. This isn't a problem if the doc is in the LRU
    // cache but we should probably fix it anyway.
    return redirect(`/docs/${lang}/${ref}/${params["*"]}`);
  } catch (_) {}
  throw json({}, { status: 404 });
};

export default function () {
  return null;
}
