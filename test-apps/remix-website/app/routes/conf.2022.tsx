import * as React from "react";
import { Outlet, useLocation } from "@remix-run/react";
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
import "~/styles/conf/2022/conf.css";
import {
  SubscribeEmailInput,
  SubscribeForm,
  SubscribeProvider,
  SubscribeStatus,
  SubscribeSubmit,
} from "~/ui/subscribe";

export const handle = { forceDark: true };

const navItems: Array<HeaderLinkProps> = [
  {
    to: "/conf/2022#speakers",
    children: "Speakers",
    prefetch: "intent",
  },
  {
    to: "/conf/2022#sponsors",
    children: "Sponsors",
    prefetch: "intent",
  },
  {
    to: "workshops",
    children: "Workshops",
    prefetch: "intent",
  },
  {
    to: "venue",
    children: "Venue",
    prefetch: "intent",
  },
  {
    to: "schedule/may-25",
    children: "Schedule",
    prefetch: "intent",
  },
];

export default function ConfTwentyTwentyTwo() {
  return (
    <div className="__layout flex h-full flex-1 flex-col bg-blue-800 text-white">
      {/* <TopBanner>
        <span className="font-bold text-pink-brand">
          Announcing: Remix Conf 2023.
        </span>{" "}
        <Link to="../2023" className="text-white underline">
          Earlybird tickets and sponsorships available now
          <span aria-hidden> →</span>
        </Link>
      </TopBanner> */}
      <Header />
      <main className="flex flex-1 flex-col" tabIndex={-1}>
        <Outlet />
      </main>
      <aside>
        <SignUp />
      </aside>
      <Footer />
    </div>
  );
}

function SignUp() {
  return (
    <section className="my-6" id="conf-newsletter-signup">
      <div className="container">
        <section className="section-signup relative">
          <div className="relative mx-auto md:max-w-xl md:py-40">
            <h2 className="h2 mb-3 font-mono text-3xl font-bold text-yellow-brand">
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
                <SubscribeSubmit className="mt-2 w-full font-mono uppercase sm:mt-0 sm:w-auto" />
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

function Header() {
  let location = useLocation();
  let isConfHome =
    location.pathname === "/conf" || location.pathname === "/conf/2022";
  return (
    <header
      className={cx("pt-10 text-white md:pt-4", {
        "absolute left-0 right-0 top-0 z-10": isConfHome,
      })}
    >
      <div className="flex items-start justify-between gap-8 px-6 py-9 lg:px-12">
        <NavLink to="." prefetch="intent" aria-label="Remix">
          <Logo />
        </NavLink>

        <nav className="flex" aria-label="Main">
          <ul className="hidden list-none items-center gap-4 font-mono md:flex md:gap-5 lg:gap-8">
            {navItems.map((item) => (
              <li key={item.to + item.children}>
                <HeaderLink
                  {...item}
                  className="text-gray-200 hover:text-white"
                />
              </li>
            ))}
            <li>
              <HeaderLink
                to="https://rmx.as/tickets"
                className="text-yellow-brand hover:text-white"
              >
                Tickets
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
    <footer
      x-comp="Footer"
      className="__footer flex items-center justify-between px-6 py-9 text-base text-white lg:px-12"
    >
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-16">
        <Link to="/" aria-label="Remix home" prefetch="intent">
          <Wordmark height={16} aria-hidden />
        </Link>
        <Link
          prefetch="intent"
          to="coc"
          className="block font-mono font-semibold leading-none"
        >
          Code of Conduct
        </Link>
        <Link
          prefetch="intent"
          to="safety"
          className="block font-mono font-semibold leading-none"
        >
          Safety
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

const HeaderLink = React.forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ to, children, className, prefetch = "none", ...props }, ref) => {
    let external = to.startsWith("https://");

    if (external) {
      return (
        <a
          ref={ref}
          x-comp="HeaderLink"
          className={cx("text-base font-semibold", className)}
          href={to}
          children={children}
          {...props}
        />
      );
    }

    return (
      <NavLink
        ref={ref}
        prefetch={prefetch}
        x-comp="HeaderLink"
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
      className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-white border-opacity-60 expanded:border-opacity-100 expanded:bg-blue-800"
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
  index,
  ...props
}: HeaderLinkProps & { index: number }) {
  return (
    <MenuLink
      index={index}
      as={HeaderLink}
      className={cx(
        className,
        "cursor-pointer select-none px-4 py-2 outline-none hover:bg-blue-700 hover:text-white selected:bg-pink-500 selected:text-white selected:hover:bg-pink-600",
      )}
      {...props}
    />
  );
}

function MobileNavList() {
  return (
    <MenuPopover className="absolute block">
      <MenuItems className="relative mt-2 block whitespace-nowrap rounded-md border-2 border-white bg-blue-800 py-2 font-mono outline-none">
        {navItems.map((item, i) => (
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
  return (
    <div className="flex items-center gap-4 font-mono md:hidden">
      <HeaderLink
        className="block text-yellow-brand hover:text-white"
        to="https://rmx.as/tickets"
      >
        Tickets
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

function Logo() {
  return (
    <svg
      viewBox="0 0 745 280"
      xmlns="http://www.w3.org/2000/svg"
      className="animated-remix-conf-logo h-[40px] w-[106px] sm:h-[50px] sm:w-[133px]"
    >
      <g transform="matrix(1,0,0,1,-227,-220)" className="remix">
        <path
          d="M486.716,356.458C482.369,366.598 474.255,370.944 461.504,370.944C447.304,370.944 435.713,363.411 434.553,347.477L525.259,347.477L525.259,334.439C525.259,299.383 502.365,269.832 459.186,269.832C418.905,269.832 388.766,299.093 388.766,339.944C388.766,381.084 418.325,406 459.765,406C493.961,406 517.724,389.486 524.389,359.934L486.716,356.458ZM768.591,273.308L768.591,402.524L815.538,402.524L815.538,273.308L768.591,273.308ZM967.943,273.308L919.548,273.308L897.523,304.018L876.079,273.308L824.206,273.308L870.862,336.757L820.148,402.523L868.544,402.523L894.335,367.467L920.127,402.523L972,402.523L920.996,334.728L967.943,273.308ZM663.111,295.327C657.604,280.261 645.723,269.832 622.829,269.832C603.413,269.832 589.503,278.523 582.548,292.719L582.548,273.308L535.602,273.308L535.602,402.523L582.548,402.523L582.548,339.075C582.548,319.663 588.054,306.916 603.413,306.916C617.613,306.916 621.091,316.187 621.091,333.86L621.091,402.523L668.037,402.523L668.037,339.075C668.037,319.663 673.253,306.916 688.902,306.916C703.102,306.916 706.29,316.187 706.29,333.86L706.29,402.523L753.236,402.523L753.236,321.402C753.236,294.458 742.804,269.832 707.159,269.832C685.425,269.832 670.066,280.841 663.111,295.327ZM288.977,402.207L227,402.207L227,373.912L278.506,373.912C287.109,373.912 288.977,380.292 288.977,384.097L288.977,402.207ZM378.379,360.512C380.018,381.564 380.018,391.433 380.018,402.204L331.306,402.204C331.306,399.858 331.348,397.712 331.39,395.535C331.522,388.769 331.66,381.714 330.564,367.466C329.115,346.606 320.131,341.971 303.613,341.971L227,341.971L227,304.018L305.931,304.018C326.796,304.018 337.229,297.671 337.229,280.868C337.229,266.092 326.796,257.138 305.931,257.138L227,257.138L227,220L314.625,220C361.861,220 385.334,242.308 385.334,277.943C385.334,304.597 368.816,321.98 346.502,324.877C365.338,328.644 376.35,339.363 378.379,360.512ZM435.133,324.878C436.872,312.71 443.537,303.439 458.606,303.439C472.516,303.439 480.051,313.29 480.631,324.878L435.133,324.878ZM768.301,261.14L815.827,261.14L815.827,220L768.301,220L768.301,261.14Z"
          fill="white"
        />
      </g>
      <g
        className="conf"
        transform="matrix(11.3585,0,0,11.3585,-1948.42,-735.56)"
      >
        <path
          d="M205.82,86.085C205.82,88.089 207.212,89.409 209.228,89.409C211.544,89.409 212.96,87.945 213.344,86.061L211.424,85.977C211.208,86.817 210.632,87.597 209.456,87.597C208.484,87.597 207.92,86.961 207.92,85.941C207.92,84.669 208.664,83.373 210.008,83.373C211.184,83.373 211.544,84.153 211.556,84.993L213.452,84.921C213.548,83.061 212.54,81.561 210.26,81.561C207.656,81.561 205.82,83.541 205.82,86.085ZM218.156,81.561C215.876,81.561 213.884,83.421 213.884,86.025C213.884,88.173 215.312,89.409 217.472,89.409C219.752,89.409 221.744,87.549 221.744,84.945C221.744,82.809 220.316,81.561 218.156,81.561ZM231.572,89.265L232.256,86.493L235.016,86.493L235.436,84.837L232.676,84.837L233.036,83.385L236.708,83.385L237.128,81.705L231.416,81.705L229.532,89.265L231.572,89.265ZM225.44,81.705L223.496,81.705L221.612,89.265L223.484,89.265L224.636,84.597L226.748,89.265L228.38,89.265L230.264,81.705L228.392,81.705L227.3,86.085L225.44,81.705ZM217.52,87.609C216.536,87.609 215.984,87.009 215.984,86.025C215.984,84.453 216.896,83.361 218.108,83.361C219.092,83.361 219.644,83.961 219.644,84.945C219.644,86.517 218.732,87.609 217.52,87.609Z"
          fill="#d83bd2"
        />
      </g>
    </svg>
  );
}
