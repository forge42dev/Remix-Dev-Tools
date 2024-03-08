import * as React from "react";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigation,
  useParams,
  useResolvedPath,
  matchPath,
} from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, HeadersFunction } from "@remix-run/node";
import { metaV1 } from "@remix-run/v1-meta";
import cx from "clsx";
import { DocSearch } from "~/ui/docsearch";

import "~/styles/docs.css";
import { Wordmark } from "~/ui/logo";
import { DetailsMenu, DetailsPopup } from "~/ui/details-menu";

import iconsHref from "~/icons.svg";
import {
  getRepoBranches,
  getRepoDocsMenu,
  getRepoTags,
  validateParams,
  getLatestVersion,
  getLatestVersionHeads,
} from "~/lib/gh-docs";
import type { Doc } from "~/lib/gh-docs";
import { octokit } from "~/lib/github.server";
import { useColorScheme } from "~/lib/color-scheme";
import { env } from "~/env.server";
import { CACHE_CONTROL } from "~/lib/http.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  let { lang = "en", ref = "main", "*": splat } = params;

  let branchesInMenu = ["main", "dev"];
  let [tags, branches] = await Promise.all([
    getRepoTags({ octokit, releasePackage: env.RELEASE_PACKAGE }),
    getRepoBranches({ octokit }),
  ]);
  if (!tags || !branches) {
    throw new Response("Cannot reach GitHub", { status: 503 });
  }

  if (process.env.NODE_ENV === "development") {
    branches.push("local");
    branchesInMenu.push("local");
  }

  let betterUrl = validateParams(tags, branches, { lang, ref, "*": splat });
  if (betterUrl) throw redirect("/docs/" + betterUrl);

  let latestVersion = getLatestVersion(tags);
  let menu = await getRepoDocsMenu(ref, lang);
  let releaseBranch = "main";
  let isLatest = ref === releaseBranch || ref === latestVersion;

  return json({
    menu,
    versions: getLatestVersionHeads(tags),
    latestVersion,
    releaseBranch,
    branches: branchesInMenu,
    currentGitHubRef: ref,
    lang,
    isLatest,
  });
};

export const meta: MetaFunction<typeof loader> = (args) => {
  return metaV1(args, {
    "docsearch:language": args.params.lang || "en",
    "docsearch:version": args.params.ref || "v1",
  });
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.doc,
    Vary: "Cookie",
  };
};

export default function DocsLayout() {
  let params = useParams();
  let navigation = useNavigation();
  let navigating =
    navigation.state === "loading" && navigation.formData == null;
  let changingVersions =
    navigating &&
    params.ref &&
    // TODO: we should have `transition.params`
    !navigation.location!.pathname.match(params.ref);

  let location = useLocation();
  let detailsRef = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    let details = detailsRef.current;
    if (details && details.hasAttribute("open")) {
      details.removeAttribute("open");
    }
  }, [location]);

  let docsContainer = React.useRef<HTMLDivElement>(null);
  useCodeBlockCopyButton(docsContainer);

  return (
    <div>
      <div className="sticky top-0 z-20">
        <Header />
        <VersionWarningMobile />
        <NavMenuMobile />
      </div>
      <div
        className={
          changingVersions
            ? "opacity-25 transition-opacity delay-300"
            : undefined
        }
      >
        <InnerContainer>
          <NavMenuDesktop />
          <div
            ref={docsContainer}
            className={cx(
              // add scroll margin to focused elements so that they aren't
              // obscured by the sticky header
              "[&_*:focus]:scroll-mt-[8rem] lg:[&_*:focus]:scroll-mt-[5rem]",
              "min-h-[80vh]",
              "lg:ml-72 lg:pl-6 xl:pl-10 2xl:pl-12",
              !changingVersions && navigating
                ? "opacity-25 transition-opacity delay-300"
                : "",
            )}
          >
            <Outlet />
          </div>
          <div className="min-w-0 pt-8 sm:pt-10 lg:ml-72 lg:pl-6 lg:pt-12 xl:pl-10 2xl:pl-12">
            <Footer />
          </div>
        </InnerContainer>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="flex justify-between gap-4 border-t border-t-gray-50 py-4 text-sm text-gray-400 dark:border-gray-800">
      <div className="sm:flex sm:items-center sm:gap-2 lg:gap-4">
        <div>
          &copy;{" "}
          <a className="hover:underline" href="https://remix.run">
            Shopify, Inc.
          </a>
        </div>
        <div className="hidden sm:block">•</div>
        <div>
          Docs and examples licensed under{" "}
          <a
            className="hover:underline"
            href="https://opensource.org/licenses/MIT"
          >
            MIT
          </a>
        </div>
      </div>
      <div>
        <EditLink />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      className={cx(
        "relative border-b border-gray-100/50 bg-white text-black dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100",
        // This hides some of the underlying text when the user scrolls to the
        // bottom which results in the overscroll bounce
        "before:absolute before:bottom-0 before:left-0 before:hidden before:h-[500%] before:w-full before:bg-inherit lg:before:block",
      )}
    >
      <InnerContainer>
        <div className="relative z-20 flex h-16 w-full items-center justify-between py-3">
          <div className="flex w-full items-center justify-between gap-4 sm:gap-8 md:w-auto">
            <Link
              className="flex"
              onContextMenu={(event) => {
                if (process.env.NODE_ENV !== "development") {
                  event.preventDefault();
                  window.location.href =
                    "https://drive.google.com/drive/u/0/folders/1pbHnJqg8Y1ATs0Oi8gARH7wccJGv4I2c";
                }
              }}
              to="/"
            >
              <Wordmark />
            </Link>
            <div className="flex items-center gap-2">
              <VersionSelect />
              <ColorSchemeToggle />
              <DocSearchSection className="lg:hidden" />
              <HeaderMenuMobile className="md:hidden" />
            </div>
          </div>
          <VersionWarningDesktop />
          <div className="flex gap-8">
            <div className="hidden items-center md:flex">
              <HeaderMenuLink to="/docs">Docs</HeaderMenuLink>
              <HeaderMenuLink to="/blog">Blog</HeaderMenuLink>
              <HeaderMenuLink to="/showcase">Showcase</HeaderMenuLink>
              <HeaderMenuLink to="/resources">Resources</HeaderMenuLink>
            </div>
            <div className="flex items-center gap-2">
              <HeaderLink
                href="https://github.com/remix-run/remix"
                svgId="github"
                label="View code on GitHub"
                title="View code on GitHub"
                svgSize="24x24"
              />
              <HeaderLink
                href="https://rmx.as/discord"
                svgId="discord"
                label="Chat on Discord"
                title="Chat on Discord"
                svgSize="24x24"
              />
            </div>
          </div>
        </div>
      </InnerContainer>
    </div>
  );
}

function VersionSelect() {
  let {
    versions,
    latestVersion,
    releaseBranch,
    branches,
    currentGitHubRef,
    lang,
  } = useLoaderData<typeof loader>();

  // This is the same default, hover, focus style as the ColorScheme trigger
  const baseClasses =
    "bg-gray-100 hover:bg-gray-200 [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";

  return (
    <DetailsMenu className="relative">
      <summary
        className={`_no-triangle relative flex h-[40px] cursor-pointer list-none items-center justify-center gap-1 rounded-full px-3 text-sm ${baseClasses}`}
      >
        <div>{currentGitHubRef}</div>
        <svg aria-hidden className="-mr-1 h-5 w-5">
          <use href={`${iconsHref}#chevrons-up-down`} />
        </svg>
      </summary>
      <DetailsPopup>
        <div className="flex flex-col gap-px">
          <VersionsLabel label="Branches" />
          {branches.map((branch) => {
            return (
              <VersionLink
                key={branch}
                to={
                  currentGitHubRef === branch ? "" : `/docs/${lang}/${branch}`
                }
              >
                {releaseBranch === branch ? `main (${latestVersion})` : branch}
              </VersionLink>
            );
          })}

          <VersionsLabel label="Versions" />
          {versions.map((version) => (
            <VersionLink
              key={version}
              to={
                currentGitHubRef === version ? "" : `/docs/${lang}/${version}`
              }
            >
              {version}
            </VersionLink>
          ))}
        </div>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function VersionsLabel({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">
      {label}
    </div>
  );
}

function VersionLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  let isExternal = to.startsWith("http");
  let isActive = useIsActivePath(to);
  let className = cx(
    "flex w-full items-center gap-2 py-2 px-2 rounded-sm text-sm transition-colors duration-100",
    isActive
      ? "text-black bg-blue-200 dark:bg-blue-800 dark:text-gray-100"
      : "text-gray-700 hover:bg-blue-200/50 hover:text-black dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-blue-800/50",
  );

  if (isExternal) {
    return (
      <a href={to} className={className}>
        {children}
      </a>
    );
  }

  return to ? (
    <Link to={to} className={className}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}

function DocSearchSection({ className }: { className?: string }) {
  return (
    <div className={cx("relative lg:sticky lg:top-0 lg:z-10", className)}>
      <div className="absolute -top-24 hidden h-24 w-full bg-white dark:bg-gray-900 lg:block" />
      <div
        className={cx(
          "relative lg:bg-white lg:dark:bg-gray-900",
          // This hides some of the underlying text when the user scrolls to the
          // bottom which results in the overscroll bounce
          "before:absolute before:bottom-0 before:left-0 before:-z-10 before:hidden before:h-[200%] before:w-full before:bg-inherit lg:before:block",
        )}
      >
        <DocSearch />
      </div>
      <div className="absolute top-full hidden h-6 w-full bg-gradient-to-b from-white dark:from-gray-900 lg:block" />
    </div>
  );
}

function ColorSchemeToggle() {
  let location = useLocation();

  // This is the same default, hover, focus style as the VersionSelect
  let baseClasses =
    "bg-gray-100 hover:bg-gray-200 [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";

  return (
    <DetailsMenu className="relative cursor-pointer">
      <summary
        className={cx(
          baseClasses,
          "_no-triangle grid h-10 w-10 place-items-center rounded-full",
        )}
      >
        <svg className="hidden h-5 w-5 dark:inline">
          <use href={`${iconsHref}#moon`} />
        </svg>
        <svg className="h-5 w-5 dark:hidden">
          <use href={`${iconsHref}#sun`} />
        </svg>
      </summary>
      <DetailsPopup>
        <Form
          preventScrollReset
          replace
          action="/_actions/color-scheme"
          method="post"
          className="flex flex-col gap-px"
        >
          <input
            type="hidden"
            name="returnTo"
            value={location.pathname + location.search}
          />
          <ColorSchemeButton
            svgId="sun"
            label="Light"
            value="light"
            name="colorScheme"
          />
          <ColorSchemeButton
            svgId="moon"
            label="Dark"
            value="dark"
            name="colorScheme"
          />
          <ColorSchemeButton
            svgId="monitor"
            label="System"
            value="system"
            name="colorScheme"
          />
        </Form>
      </DetailsPopup>
    </DetailsMenu>
  );
}

let ColorSchemeButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button"> & { svgId: string; label: string }
>(({ svgId, label, ...props }, forwardedRef) => {
  let colorScheme = useColorScheme();
  return (
    <button
      {...props}
      ref={forwardedRef}
      disabled={colorScheme === props.value}
      className={cx(
        "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors duration-100",
        colorScheme === props.value
          ? "bg-blue-200 text-black dark:bg-blue-800 dark:text-gray-100"
          : "text-gray-700 hover:bg-blue-200/50 hover:text-black dark:text-gray-400 dark:hover:bg-blue-800/50 dark:hover:text-gray-100",
      )}
    >
      <svg className="h-4 w-4">
        <use href={`${iconsHref}#${svgId}`} />
      </svg>{" "}
      {label}
    </button>
  );
});

function VersionWarningMobile() {
  let { isLatest, branches, currentGitHubRef } = useLoaderData<typeof loader>();
  if (isLatest) return null;

  return (
    <div className="text-center lg:hidden">
      <div className="bg-blue-brand p-2 text-xs text-white">
        <VersionWarningMessage
          branches={branches}
          currentGitHubRef={currentGitHubRef}
        />
      </div>
    </div>
  );
}

function VersionWarningDesktop() {
  let { isLatest, branches, currentGitHubRef } = useLoaderData<typeof loader>();
  if (isLatest) return null;

  return (
    <div className="hidden lg:block">
      <div className="animate-[bounce_500ms_2.5] bg-blue-brand p-2 text-xs text-white">
        <VersionWarningMessage
          branches={branches}
          currentGitHubRef={currentGitHubRef}
        />
      </div>
    </div>
  );
}

function VersionWarningMessage({
  branches,
  currentGitHubRef,
}: {
  branches: string[];
  currentGitHubRef: string;
}) {
  let { "*": splat } = useParams();

  // Don't want to show release-next in the menu, but we do want to show
  // the branch-warning
  let warning = [...branches, "release-next"].includes(currentGitHubRef)
    ? `Viewing docs for ${currentGitHubRef} branch, not the latest release`
    : `Viewing docs for an older release`;

  return (
    <>
      {warning}.{" "}
      <Link
        to={splat ? `/docs/en/main/${splat}` : "/docs/en/main"}
        className="underline"
      >
        View latest
      </Link>
    </>
  );
}

function HeaderMenuLink({
  className = "",
  to,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  let isActive = useIsActivePath(to);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={cx(
        className,
        "p-2 py-2.5 text-sm leading-none underline-offset-4 hover:underline md:p-3",
        isActive
          ? "text-black underline decoration-black dark:text-gray-200 dark:decoration-gray-200"
          : "text-gray-500 decoration-gray-200 dark:text-gray-400 dark:decoration-gray-500",
      )}
    >
      {children}
    </Link>
  );
}

function HeaderMenuMobile({ className = "" }: { className: string }) {
  // This is the same default, hover, focus style as the VersionSelect
  let baseClasses =
    "bg-gray-100 hover:bg-gray-200 [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";

  return (
    <DetailsMenu className={cx("relative cursor-pointer", className)}>
      <summary
        className={cx(
          baseClasses,
          "_no-triangle grid h-10 w-10 place-items-center rounded-full",
        )}
      >
        <svg className="h-5 w-5">
          <use href={`${iconsHref}#menu`} />
        </svg>
      </summary>
      <DetailsPopup>
        <div className="flex flex-col">
          <HeaderMenuLink to="/docs">Docs</HeaderMenuLink>
          <HeaderMenuLink to="/blog">Blog</HeaderMenuLink>
          <HeaderMenuLink to="/showcase">Showcase</HeaderMenuLink>
          <HeaderMenuLink to="/resources">Resources</HeaderMenuLink>
        </div>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function HeaderLink({
  className = "",
  href,
  svgId,
  label,
  svgSize,
  title,
}: {
  className?: string;
  href: string;
  svgId: string;
  label: string;
  svgSize: string;
  title?: string;
}) {
  let [width, height] = svgSize.split("x");

  return (
    <a
      href={href}
      className={cx(
        `hidden h-10 w-10 place-items-center text-black hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-50 md:grid`,
        className,
      )}
      title={title}
    >
      <span className="sr-only">{label}</span>
      <svg aria-hidden style={{ width: `${width}px`, height: `${height}px` }}>
        <use href={`${iconsHref}#${svgId}`} />
      </svg>
    </a>
  );
}

function NavMenuMobile() {
  let doc = useDoc();
  return (
    <div className="lg:hidden">
      <DetailsMenu className="group relative flex h-full flex-col">
        <summary
          tabIndex={0}
          className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700"
        >
          <div className="flex items-center gap-2">
            <svg aria-hidden className="h-5 w-5 group-open:hidden">
              <use href={`${iconsHref}#chevron-r`} />
            </svg>
            <svg aria-hidden className="hidden h-5 w-5 group-open:block">
              <use href={`${iconsHref}#chevron-d`} />
            </svg>
          </div>
          <div className="whitespace-nowrap font-bold">
            {doc ? doc.attrs.title : "Navigation"}
          </div>
        </summary>
        <div className="absolute h-[66vh] w-full overflow-auto overscroll-contain border-b bg-white p-2 pt-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:shadow-black">
          <Menu />
        </div>
      </DetailsMenu>
    </div>
  );
}

function NavMenuDesktop() {
  return (
    <div className="fixed bottom-0 top-16 -ml-3 hidden w-72 flex-col gap-6 overflow-auto pb-10 pr-5 pt-5 lg:flex">
      <DocSearchSection />
      <div className="[&_*:focus]:scroll-mt-[6rem]">
        <Menu />
      </div>
    </div>
  );
}

function Menu() {
  let { menu } = useLoaderData<typeof loader>();
  return menu ? (
    <nav>
      <ul>
        {menu.map((category) => (
          <li key={category.attrs.title} className="[&:not(:last-child)]:mb-6">
            <MenuCategoryHeading to={category.hasContent && category.slug}>
              {category.attrs.title}
            </MenuCategoryHeading>
            {category.children.map((doc) => (
              <MenuLink key={doc.slug} to={doc.slug}>
                {doc.attrs.title} {doc.attrs.new && "🆕"}
              </MenuLink>
            ))}
          </li>
        ))}
      </ul>
    </nav>
  ) : (
    <div className="bold text-gray-300 dark:text-gray-400">
      Failed to load menu
    </div>
  );
}

function MenuCategoryHeading({
  children,
  to,
}: {
  children: React.ReactNode;
  to?: string | null | false;
}) {
  let className =
    "flex items-center px-3 mb-2 text-base leading-[1.125] font-semibold rounded-md";
  return to ? (
    <MenuCategoryLink to={to} className={className} children={children} />
  ) : (
    <div className={className} children={children} />
  );
}

function MenuCategoryLink({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  let isActive = useIsActivePath(to);
  return (
    <Link
      prefetch="intent"
      to={to}
      className={cx(
        className,
        "group",
        isActive
          ? "bg-gray-50 font-semibold text-blue-brand dark:bg-gray-800"
          : "text-inherit hover:text-gray-900 active:text-blue-brand dark:hover:text-gray-50 dark:active:text-blue-brand",
      )}
    >
      {children}
    </Link>
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  let isActive = useIsActivePath(to);
  return (
    <Link
      prefetch="intent"
      to={to}
      className={cx(
        "group relative my-px flex min-h-[2.25rem] items-center rounded-2xl border-transparent px-3 py-2 text-sm",
        "outline-none transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800  dark:focus-visible:ring-gray-100",
        isActive
          ? ["text-black dark:text-gray-100", "bg-blue-200 dark:bg-blue-800"]
          : [
              "text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-100",
              "hover:bg-blue-100 dark:hover:bg-blue-800/50",
            ],
      )}
      children={children}
    />
  );
}

function EditLink() {
  let doc = useDoc();
  let params = useParams();
  let isEditableRef = params.ref === "main" || params.ref === "dev";

  if (!doc || !isEditableRef) {
    return null;
  }

  let repoUrl = "https://github.com/remix-run/remix";
  // TODO: deal with translations when we add them with params.lang
  let editUrl = `${repoUrl}/edit/${params.ref}/${doc.slug}.md`;

  return (
    <a className="flex items-center gap-1 hover:underline" href={editUrl}>
      Edit
      <svg aria-hidden className="h-4 w-4">
        <use href={`${iconsHref}#edit`} />
      </svg>
    </a>
  );
}

function InnerContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="m-auto px-4 sm:px-6 lg:px-8 xl:max-w-[90rem]">
      {children}
    </div>
  );
}

function hasDoc(data: unknown): data is { doc: Doc } {
  return !!data && typeof data === "object" && "doc" in data;
}

function useDoc(): Doc | null {
  let data = useMatches().at(-1)?.data;
  if (!hasDoc(data)) return null;
  return data.doc;
}

function useIsActivePath(to: string) {
  let { pathname } = useResolvedPath(to);
  let navigation = useNavigation();
  let currentLocation = useLocation();
  let navigating =
    navigation.state === "loading" && navigation.formData == null;
  let location = navigating ? navigation.location! : currentLocation;
  let match = matchPath(pathname + "/*", location.pathname);
  return Boolean(match);
}

function useCodeBlockCopyButton(ref: React.RefObject<HTMLDivElement>) {
  let location = useLocation();
  React.useEffect(() => {
    let container = ref.current;
    if (!container) return;

    let codeBlocks = container.querySelectorAll(
      "[data-code-block][data-lang]:not([data-nocopy])",
    );
    let buttons = new Map<
      HTMLButtonElement,
      { listener: (event: MouseEvent) => void; to: number }
    >();

    for (let codeBlock of codeBlocks) {
      let button = document.createElement("button");
      let label = document.createElement("span");
      button.type = "button";
      button.dataset.codeBlockCopy = "";
      button.addEventListener("click", listener);

      label.textContent = "Copy code to clipboard";
      label.classList.add("sr-only");
      button.appendChild(label);
      codeBlock.appendChild(button);
      buttons.set(button, { listener, to: -1 });

      function listener(event: MouseEvent) {
        event.preventDefault();
        let pre = codeBlock.querySelector("pre");
        let text = pre?.textContent;
        if (!text) return;
        navigator.clipboard
          .writeText(text)
          .then(() => {
            button.dataset.copied = "true";
            let to = window.setTimeout(() => {
              window.clearTimeout(to);
              if (button) {
                button.dataset.copied = undefined;
              }
            }, 3000);
            if (buttons.has(button)) {
              buttons.get(button)!.to = to;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
    return () => {
      for (let [button, props] of buttons) {
        button.removeEventListener("click", props.listener);
        button.parentElement?.removeChild(button);
        window.clearTimeout(props.to);
      }
    };
  }, [ref, location.pathname]);
}
