import * as React from "react";
import {
  Outlet,
  useLocation,
  useLoaderData,
  useMatches,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, NavLink } from "~/ui/link";
import { Wordmark } from "~/ui/logo";
import { Discord, GitHub, Twitter, YouTube } from "~/ui/icons";
import {
  Menu,
  MenuButton,
  MenuPopover,
  MenuItems,
  MenuLink,
} from "~/ui/primitives/menu-button";
import cx from "clsx";
import "~/styles/conf/2023/conf.css";
import {
  SubscribeEmailInput,
  SubscribeForm,
  SubscribeProvider,
  SubscribeStatus,
  SubscribeSubmit,
} from "~/ui/subscribe";
import { CACHE_CONTROL } from "~/lib/http.server";
import invariant from "tiny-invariant";

export const handle = { forceDark: true };

// March 1 at 12:00am
const EARLY_BIRD_ENDING_TIME = 1646121600000;

export const loader = async (_: LoaderFunctionArgs) => {
  return json(
    { earlyBird: Date.now() < EARLY_BIRD_ENDING_TIME },
    { headers: { "Cache-Control": CACHE_CONTROL.conf } },
  );
};

const menuItems: Array<HeaderLinkProps> = [
  {
    to: "/conf/2023#speakers",
    children: "Speakers",
  },
  {
    to: "schedule",
    children: "Schedule",
  },
  {
    to: "https://book.passkey.com/event/50366389/owner/1422/home",
    children: "Book Your Stay",
  },
  {
    to: "sponsor",
    children: "Become a Sponsor",
  },
];

export default function ConfTwentyTwentyThree() {
  let data = useLoaderData<typeof loader>();
  let showTopBanner = data.earlyBird;
  return (
    <>
      {showTopBanner ? <TopBanner /> : null}
      <div className="__layout flex h-full flex-1 flex-col bg-black text-white">
        <Header hasTopBanner={showTopBanner} />
        <main className="flex flex-1 flex-col" tabIndex={-1}>
          <Outlet />
        </main>
        <aside>
          <SignUp />
        </aside>
        <Footer />
      </div>
    </>
  );
}

function SignUp() {
  return (
    <section className="my-6" id="conf-newsletter-signup">
      <div className="container">
        <section className="section-signup relative">
          <div className="relative mx-auto md:max-w-xl md:py-40">
            <h2 className="h2 mb-3 text-3xl font-bold text-yellow-brand">
              Stay Updated
            </h2>
            <div className="mb-6 flex items-center gap-4">
              <a
                href="https://rmx.as/discord"
                aria-label="Discord"
                title="Join Discord"
              >
                <Discord aria-hidden />
              </a>
              <p className="text-lg opacity-80 md:text-xl">
                <a className="underline" href="https://rmx.as/discord">
                  Join the Remix community on Discord
                </a>{" "}
                to keep up with what's going on with the conference and the
                Remix Community as a whole.
              </p>
            </div>
            <p
              className="mb-6 text-lg opacity-80 md:text-xl"
              id="newsletter-text"
            >
              To get exclusive updates announcements about Remix Conf, subscribe
              to our newsletter!
            </p>
            <SubscribeProvider>
              <SubscribeForm aria-describedby="newsletter-text">
                <SubscribeEmailInput />
                <SubscribeSubmit className="mt-2 w-full uppercase sm:mt-0 sm:w-auto" />
              </SubscribeForm>
              <p className="mt-3 text-sm text-white opacity-60">
                We respect your privacy; unsubscribe at any time.
              </p>
              <SubscribeStatus />
            </SubscribeProvider>
          </div>
        </section>
      </div>
    </section>
  );
}

function Header({ hasTopBanner }: { hasTopBanner?: boolean }) {
  let location = useLocation();
  let isConfHome =
    location.pathname === "/conf" || location.pathname === "/conf/2023";
  return (
    <header
      className={cx("absolute left-0 right-0 top-0 z-10 text-white", {
        "absolute left-0 right-0 top-0 z-10": isConfHome,
      })}
    >
      <div className="flex items-start justify-between gap-8 px-6 py-9 lg:px-12">
        <NavLink
          to={isConfHome ? "/" : "."}
          prefetch="intent"
          aria-label="Remix"
          className="opacity-80 transition-opacity duration-200 hover:opacity-100"
        >
          <Wordmark />
        </NavLink>

        <nav className="flex" aria-label="Main">
          <ul className="hidden list-none items-center gap-4 md:flex md:gap-5 lg:gap-8">
            {menuItems.map((item) => (
              <li key={item.to + item.children}>
                <HeaderLink
                  {...item}
                  className="opacity-80 transition-opacity duration-200 hover:opacity-100"
                />
              </li>
            ))}
            <li>
              <HeaderLink
                to="https://rmx.as/tickets"
                className="text-pink-brand transition-colors duration-200 hover:text-white"
              >
                Buy Tickets
              </HeaderLink>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="__footer flex items-center justify-between px-6 py-9 text-base text-white lg:px-12">
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-16">
        <Link to="/" aria-label="Remix home" prefetch="intent">
          <Wordmark height={16} aria-hidden />
        </Link>
        <Link
          prefetch="intent"
          to="coc"
          className="block font-semibold leading-none"
        >
          Code of Conduct
        </Link>
      </div>
      <nav className="flex gap-6 text-white" aria-label="Find us on the web">
        <a href="https://github.com/remix-run" aria-label="GitHub">
          <GitHub aria-hidden />
        </a>
        <a href="https://twitter.com/remix_run" aria-label="Twitter">
          <Twitter aria-hidden />
        </a>
        <a href="https://youtube.com/remix_run" aria-label="YouTube">
          <YouTube aria-hidden />
        </a>
        <a href="https://rmx.as/discord" aria-label="Discord">
          <Discord aria-hidden />
        </a>
      </nav>
    </footer>
  );
}

interface HeaderLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: "none" | "intent";
}

function isExternalUrl(value: string, currentHost: string) {
  try {
    let url = new URL(value);
    return url.host !== currentHost;
  } catch (err) {
    return false;
  }
}

function hasHost(data: unknown): data is { host: string } {
  return !!data && typeof data === "object" && "host" in data;
}

const HeaderLink = React.forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ to, children, className, prefetch = "none", ...props }, ref) => {
    let rootMatchData = useMatches().find((match) => match.id === "root")?.data;
    invariant(hasHost(rootMatchData), "No host found in root match data");
    let external = isExternalUrl(to, rootMatchData.host);
    if (external) {
      return (
        <a
          ref={ref}
          className={cx("text-base font-semibold", className)}
          href={to}
          children={children}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      );
    }

    return (
      <NavLink
        ref={ref}
        prefetch={prefetch}
        className={cx("text-base font-semibold", className)}
        to={to}
        children={children}
        {...props}
      />
    );
  },
);

function MobileNavButton() {
  return (
    <MenuButton
      id="nav-button"
      aria-label="Toggle menu"
      className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-white border-opacity-60 expanded:border-opacity-100 expanded:bg-black"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    </MenuButton>
  );
}

function MobileMenuItem({
  className,
  ...props
}: HeaderLinkProps & {
  index: number;
}) {
  return (
    <MenuLink
      as={HeaderLink}
      className={cx(
        className,
        "cursor-pointer select-none px-4 py-2 outline-none hover:bg-gray-700 hover:text-white selected:bg-pink-500 selected:text-white selected:hover:bg-pink-600",
      )}
      {...props}
    />
  );
}

function MobileNavList() {
  return (
    <MenuPopover className="absolute block">
      <MenuItems className="relative mt-2 block whitespace-nowrap rounded-md border-2 border-white bg-black py-2 outline-none">
        {menuItems.map((item, i) => (
          <MobileMenuItem
            key={item.to + item.children}
            index={i}
            {...item}
            className="block text-white text-opacity-90 hover:text-opacity-100"
          />
        ))}
      </MenuItems>
    </MenuPopover>
  );
}

function MobileNav() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="flex items-center gap-4 md:hidden">
      <HeaderLink
        className="block text-yellow-brand hover:text-white"
        to="https://rmx.as/tickets"
      >
        Buy Tickets{" "}
        {data.earlyBird ? (
          <small title="Early Bird discount!"> 🐣</small>
        ) : null}
      </HeaderLink>
      <div>
        <Menu>
          <MobileNavButton />
          <MobileNavList />
        </Menu>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TopBanner() {
  return (
    <div className="sticky top-0 z-20 bg-black py-2">
      <p className="container mx-auto flex flex-col items-center justify-center text-[3.2vw] sm:text-[16px] md:flex-row md:gap-1">
        <span className="font-bold text-pink-brand">
          Announcing: Remix Conf 2023.
        </span>{" "}
        <a href="https://rmx.as/tickets" className="text-white underline">
          30% discount available now.
          <span aria-hidden> ↗</span>
        </a>
      </p>
    </div>
  );
}
