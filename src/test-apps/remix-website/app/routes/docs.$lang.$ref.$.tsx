import * as React from "react";
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useMatches,
  useParams,
  useRouteError,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { metaV1, getMatchesData } from "@remix-run/v1-meta";
import { CACHE_CONTROL, handleRedirects } from "~/lib/http.server";
import invariant from "tiny-invariant";
import type { Doc } from "~/lib/gh-docs";
import { getRepoDoc } from "~/lib/gh-docs";
import iconsHref from "~/icons.svg";
import cx from "clsx";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-links";
import type { loader as docsLayoutLoader } from "~/routes/docs.$lang.$ref";
import type { loader as rootLoader } from "~/root";

export async function loader({ params, request }: LoaderFunctionArgs) {
  let url = new URL(request.url);
  let pageUrl = url.protocol + "//" + url.host + url.pathname;
  invariant(params.ref, "expected `ref` params");
  try {
    let slug = params["*"]?.endsWith("/changelog")
      ? "CHANGELOG"
      : `docs/${params["*"] || "index"}`;
    let doc = await getRepoDoc(params.ref, slug);
    if (!doc) throw null;
    return json(
      { doc, pageUrl },
      { headers: { "Cache-Control": CACHE_CONTROL.doc } },
    );
  } catch (_) {
    if (params.ref === "main" && params["*"]) {
      // Only perform redirects for 404's on `main` URLs which are likely being
      // redirected from the root `/docs/{slug}`.  If someone is direct linking
      // to a missing slug on an old version or tag, then a 404 feels appropriate.
      handleRedirects(`/docs/${params["*"]}`);
    }
    throw json(null, { status: 404 });
  }
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  // Inherit the caching headers from the loader so we do't cache 404s
  let headers = new Headers(loaderHeaders);
  headers.set("Vary", "Cookie");
  return headers;
};

const LAYOUT_LOADER_KEY = "routes/docs.$lang.$ref";

type Loader = typeof loader;
type MatchLoaders = {
  [LAYOUT_LOADER_KEY]: typeof docsLayoutLoader;
  root: typeof rootLoader;
};

export const meta: MetaFunction<Loader, MatchLoaders> = (args) => {
  let { data } = args;

  let matchesData = getMatchesData<Loader, MatchLoaders>(args);
  let parentData = matchesData[LAYOUT_LOADER_KEY];
  if (!data) {
    return metaV1(args, {
      title: "Not Found",
    });
  }

  let { doc } = data;

  let { latestVersion, releaseBranch, branches, currentGitHubRef } = parentData;

  let titleAppend =
    currentGitHubRef === releaseBranch || currentGitHubRef === latestVersion
      ? ""
      : branches.includes(currentGitHubRef)
        ? ` (${currentGitHubRef} branch)`
        : currentGitHubRef.startsWith("v")
          ? ` (${currentGitHubRef})`
          : ` (v${currentGitHubRef})`;

  let title = doc.attrs.title + titleAppend;

  // seo: only want to index the main branch
  let isMainBranch = currentGitHubRef === releaseBranch;

  let robots =
    matchesData.root.isProductionHost && isMainBranch
      ? "index,follow"
      : "noindex,nofollow";

  let pageUrl = data.pageUrl;

  // TODO: add more + better SEO stuff
  // let url = new URL(data.pageUrl);
  // let siteUrl = url.protocol + "//" + url.host;
  // let ogImage = `${siteUrl}/image.jpg`;
  // let ogImageAlt = title;
  // let twitterImage = ogImage;
  // let twitterImageAlt = title;
  // let description: 'some description';

  return metaV1(args, {
    title: `${title} | Remix`,
    // description,

    "og:title": title,
    // "og:description": description,
    "og:url": pageUrl,
    "og:type": "article",
    "og:site_name": "Remix",
    // "og:image": ogImage,
    // "og:image:alt": ogImageAlt,
    // "og:image:secure_url": ogImage,
    // "og:image:type": "image/jpeg",
    // "og:image:width": "1200",
    // "og:image:height": "630",
    // "og:locale": "en_US",

    "twitter:title": title,
    "twitter:site": "@remix_run",
    "twitter:creator": "@remix_run",
    // "twitter:image": twitterImage,
    // "twitter:image:alt": twitterImageAlt,
    // "twitter:description": description,
    // "twitter:card": "summary",

    robots: robots,
    googlebot: robots,
  });
};

export default function DocPage() {
  let { doc } = useLoaderData<typeof loader>();
  let ref = React.useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(ref);
  let matches = useMatches();
  let isDocsIndex = matches.some((match) =>
    match.id.endsWith("$lang.$ref/index"),
  );

  return (
    <div className="xl:flex xl:w-full xl:justify-between xl:gap-8">
      {isDocsIndex ? null : doc.headings.length > 3 ? (
        <>
          <SmallOnThisPage doc={doc} />
          <LargeOnThisPage doc={doc} />
        </>
      ) : (
        <div className="hidden xl:order-1 xl:block xl:w-56 xl:flex-shrink-0" />
      )}
      <div className="min-w-0 pt-12 xl:flex-grow xl:pt-20">
        <div ref={ref} className="markdown w-full max-w-3xl pb-[33vh]">
          <div
            className="md-prose"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
        </div>
      </div>
    </div>
  );
}

function LargeOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <div className="sticky top-36 order-1 mt-20 hidden max-h-[calc(100vh-9rem)] w-56 flex-shrink-0 self-start overflow-y-auto pb-10 xl:block">
      <nav className="mb-3 flex items-center font-semibold">On this page</nav>
      <ul className="md-toc flex flex-col flex-wrap gap-3 leading-[1.125]">
        {doc.headings.map((heading, i) => {
          return (
            <li key={i}>
              <Link
                to={`#${heading.slug}`}
                dangerouslySetInnerHTML={{ __html: heading.html || "" }}
                className={cx(
                  "group relative py-1 text-sm text-gray-500 decoration-gray-200 underline-offset-4 hover:underline dark:text-gray-400 dark:decoration-gray-500",
                )}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SmallOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <details className="group -mx-4 flex h-full flex-col sm:-mx-6 lg:mx-0 lg:mt-4 xl:ml-80 xl:hidden">
      <summary className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700">
        <div className="flex items-center gap-2">
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
        </div>
        <div className="whitespace-nowrap">On this page</div>
      </summary>
      <ul className="pl-9">
        {doc.headings.map((heading, i) => (
          <li key={i}>
            <Link
              to={`#${heading.slug}`}
              dangerouslySetInnerHTML={{ __html: heading.html || "" }}
              className="block py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            />
          </li>
        ))}
      </ul>
    </details>
  );
}

export function ErrorBoundary() {
  let error = useRouteError();
  let params = useParams();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <h1 className="text-9xl font-bold">{error.status}</h1>
        <p className="text-lg">
          {[400, 404].includes(error.status) ? (
            <>
              There is no doc for <i className="text-gray-500">{params["*"]}</i>
            </>
          ) : (
            error.statusText
          )}
        </p>
      </div>
    );
  }
  throw error;
}
