import * as React from "react";
import { Link as RemixLink, NavLink as RemixNavLink } from "@remix-run/react";
import type { LinkProps, NavLinkProps } from "@remix-run/react";

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      prefetch,
      preventScrollReset,
      relative,
      reloadDocument,
      replace,
      state,
      to,
      ...props
    },
    ref,
  ) => {
    if (typeof to === "string" && isAbsoluteUrl(to)) {
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      return <a {...props} href={to} />;
    }
    return (
      <RemixLink
        x-comp="Link"
        {...props}
        ref={ref}
        to={to}
        prefetch={prefetch}
        preventScrollReset={preventScrollReset}
        relative={relative}
        reloadDocument={reloadDocument}
        replace={replace}
        state={state}
      />
    );
  },
);

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      caseSensitive,
      children,
      className,
      end,
      prefetch,
      preventScrollReset,
      relative,
      reloadDocument,
      replace,
      state,
      style,
      to,
      ...props
    },
    ref,
  ) => {
    if (typeof to === "string" && isAbsoluteUrl(to)) {
      let isActive = false;
      let isPending = false;
      let isTransitioning = false;
      className =
        typeof className === "function"
          ? className({ isActive, isPending, isTransitioning })
          : className;
      style =
        typeof style === "function"
          ? style({ isActive, isPending, isTransitioning })
          : style;
      children =
        typeof children === "function"
          ? children({ isActive, isPending, isTransitioning })
          : children;
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      return (
        <a
          {...props}
          href={to}
          style={style}
          className={className}
          children={children}
        />
      );
    }
    return (
      <RemixNavLink
        x-comp="NavLink"
        {...props}
        ref={ref}
        caseSensitive={caseSensitive}
        children={children}
        className={className}
        end={end}
        prefetch={prefetch}
        preventScrollReset={preventScrollReset}
        relative={relative}
        reloadDocument={reloadDocument}
        replace={replace}
        state={state}
        style={style}
        to={to}
      />
    );
  },
);

function isAbsoluteUrl(str: string) {
  // Using URL can cause hydration issues, revisit later
  //   try {
  //     new URL(str);
  //     return true;
  //   } catch (_) {
  //     return false;
  //   }

  // https://github.com/sindresorhus/is-absolute-url/blob/main/index.js
  const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
  const WINDOWS_PATH_REGEX = /^[a-zA-Z]:\\/;

  if (WINDOWS_PATH_REGEX.test(str)) {
    return false;
  }
  return ABSOLUTE_URL_REGEX.test(str);
}

Link.displayName = "Link";
NavLink.displayName = "NavLink";

export { Link, NavLink };
