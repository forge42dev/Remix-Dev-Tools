import { NavLink } from "~/ui/link";
import { Wordmark } from "~/ui/logo";
import { DetailsMenu, DetailsPopup } from "~/ui/details-menu";
import cx from "clsx";
import iconsHref from "~/icons.svg";

export function Header({
  forceDark,
  to = "/",
  className = "",
}: {
  forceDark?: boolean;
  to?: string;
  className?: string;
}) {
  return (
    <header
      className={cx(
        "flex items-center justify-between px-6 py-9 lg:px-12",
        forceDark ? "text-white " : "text-gray-900 dark:text-white ",
        className,
      )}
    >
      <NavLink
        onContextMenu={(event) => {
          if (process.env.NODE_ENV !== "development") {
            event.preventDefault();
            window.location.href =
              "https://drive.google.com/drive/u/0/folders/1pbHnJqg8Y1ATs0Oi8gARH7wccJGv4I2c";
          }
        }}
        to={to}
        prefetch="intent"
        aria-label="Remix"
      >
        <Wordmark aria-hidden />
      </NavLink>

      <nav className="hidden gap-8 md:flex" aria-label="Main">
        <HeaderLink to="/docs/en/main">Docs</HeaderLink>
        <HeaderLink to="/blog">Blog</HeaderLink>
        <HeaderLink to="/showcase">Showcase</HeaderLink>
        <HeaderLink to="/resources">Resources</HeaderLink>
      </nav>

      <HeaderMenuMobile className="md:hidden" />
    </header>
  );
}

function HeaderMenuMobile({ className = "" }: { className: string }) {
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
        <nav className="flex flex-col gap-2 px-2 py-2.5">
          <HeaderLink to="/docs/en/main">Docs</HeaderLink>
          <HeaderLink to="/blog">Blog</HeaderLink>
          <HeaderLink to="/showcase">Showcase</HeaderLink>
          <HeaderLink to="/resources">Resources</HeaderLink>
        </nav>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function HeaderLink({
  to,
  children,
  className = "",
  prefetch = "none",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: "none" | "intent";
}) {
  return (
    <NavLink
      prefetch={prefetch}
      x-comp="HeaderLink"
      className={cx(
        "text-base font-semibold opacity-80 last:mr-0 hover:opacity-100",
        className,
      )}
      to={to}
      children={children}
    />
  );
}
