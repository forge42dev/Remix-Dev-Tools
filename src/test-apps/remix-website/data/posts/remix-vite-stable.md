---
title: Remix Vite is Now Stable
summary: Support for Vite is now stable in Remix v2.7.
date: 2024-02-20
image: /blog-images/headers/remix-vite-stable.jpg
# Image source: https://unsplash.com/photos/blue-and-purple-led-lights-2RLRbRkWtpc
imageAlt: "Remix Vite is Now Stable"
authors:
  - Mark Dalgleish
  - Pedro Cattori
---

Today we’re excited to announce that support for [Vite] is now stable in Remix v2.7.0! After the [initial unstable release of Remix Vite][remix-vite-release], we’ve been hard at work refining and extending it over the past few months with help from all of our early adopters and community contributors.

Here’s what we’ve been up to:

- Closed [75 issues][remix-vite-issues] and merged [136 pull requests][remix-vite-pull-requests] related to Vite.
- Migrated [the website you’re currently looking at][remix-run] to Vite, and assisted in the migration of [kentcdodds.com] and [shop.app] — with the latter resulting in a 50x HMR speed boost.
- Shipped several new features and major improvements on top of Vite.

Let’s break down the most significant changes since our initial release.

## SPA mode

The most significant change we’ve made is so important that we’ll reserve discussing its impact on the React ecosystem for a later post.

The short version is that Remix now supports building purely static sites that don’t require a JavaScript server in production, all while keeping the benefits of Remix’s file based route conventions, automatic code splitting, route module prefetching, head tag management and more.

This unlocks an entirely new migration path for [React Router][react-router] consumers to move to Remix without having to switch to a server-rendered architecture — which for many people isn’t even an option.
And for anyone that wants to introduce a server to their Remix app in the future, the migration path is now much more straightforward.

For more information, check out the [SPA mode documentation][spa-mode].

## Basename support

[React Router supports setting a basename for your app][react-router-basename], allowing you to nest your entire application within a subpath — but this feature was [notably absent in Remix][remix-basename-discussion].
While it was possible to work around this by manually prefixing routes and links, it obviously wasn’t as convenient as setting a single config value.

With the move to Vite, the lack of basename support became more apparent since [Vite exposes its own “base” option][vite-base].
Many consumers mistakenly assumed that this would work with Remix, but this option is really the same as [Remix’s “publicPath” option][remix-public-path].

In order to avoid this confusion, there is no longer a `publicPath` option (you should use Vite’s `base` option instead), and the Remix Vite plugin now has a brand new `basename` option.

As a result, it’s never been easier to nest your Remix application within a subpath of your site, without having to touch your application code.

```tsx
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/my-app/public/",
  plugins: [
    remix({
      basename: "/my-app",
    }),
  ],
});
```

## Cloudflare Pages support

With our initial unstable release of Remix Vite, [Cloudflare Pages][cloudflare-pages] support wasn’t quite ready yet. Cloudflare’s `workerd` runtime is completely separate from Vite’s Node environment so we needed to figure out the best way to bridge this gap.

With Remix Vite going stable, we now provide a built-in Vite plugin for integrating Cloudflare’s tooling with Remix during local development.

To simulate the Cloudflare environment in Vite, [Wrangler][wrangler] provides [Node proxies to local `workerd` bindings][wrangler-getplatformproxy].
Remix’s `cloudflareDevProxyVitePlugin` sets up these proxies for you:

```ts filename=vite.config.ts lines=[3,8]
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remixCloudflareDevProxy(), remix()],
});
```

The proxies are then available within `context.cloudflare` in your `loader` or `action` functions:

```ts
export const loader = ({ context }: LoaderFunctionArgs) => {
  const { env, cf, ctx } = context.cloudflare;
  // ... more loader code here...
};
```

We’re still actively working with the Cloudflare team to ensure the best possible experience for Remix users.
In the future the integration is likely to be even more seamless by leveraging Vite’s new (still experimental) [Runtime API][vite-runtime-api], so stay tuned for further updates.

For more information on this feature, check out the [Remix Vite + Cloudflare documentation][remix-vite-cloudflare].

## Server bundles

For those of you who have been running [Remix on Vercel][remix-on-vercel], you may have noticed that Vercel allows you to split your server build into multiple bundles with different routes targeting [serverless][remix-vercel-serverless] and [edge functions][remix-vercel-edge].

What you may not have realized is that this feature is actually achieved via a [fork of Remix][vercel-remix-fork] that Vercel uses in its [Remix builder][vercel-remix-builder].

With the move to Vite, we wanted to ensure that another fork of our build system wasn’t necessary, so we’ve been working with the Vercel team to bring this feature to Remix Vite.
Now _anyone_ — not just Vercel consumers — can split their server build into multiple bundles however they like.

Huge thanks to Vercel, and most notably [Nathan Rajlich][nathan-rajlich], for helping out with this work.
For more information on this feature, check out the [server bundles documentation][server-bundles].

## Presets

When investigating Vercel support for Remix Vite, it became clear that we needed a way for other tools and hosting providers to customize the behavior of the Vite plugin without reaching into internals or running their own forks.
To support this, we’ve introduced the concept of “presets”.

Presets can only do two things:

- Configure the Remix Vite plugin on your behalf.
- Validate the resolved config.

Presets are designed to be published to npm and used within your Vite config.

The Vercel preset is coming soon, and we’re excited to see what other presets the community comes up with — especially since presets have access to all Remix Vite plugin options and are therefore not strictly limited to hosting provider support.

For more information on this feature, including guidance on how to create your own presets, check out the [presets documentation][presets].

## Better server and client separation

Remix allows you to name files with a `.server.ts` extension to ensure they never accidentally end up on the client.
However, it turned out that our previous implementation wasn’t compatible with Vite’s ESM model, so we were forced to revisit our approach.

Instead, what if we made it a compile-time error whenever `.server.ts` files are imported in a client code path?

Our previous approach resulted in runtime errors that could easily slip through to production.
Raising these errors during the build prevents them from impacting real users, while providing faster, more comprehensive feedback to developers.
We quickly realized this is _much_ better.

As a bonus, since we were already working in this area, we decided to add support for `.server` _directories_, not just files, making it easy to mark entire portions of your project as server-only.

If you’d like to dive deeper into the rationale behind this change, check out our [decision document on splitting up client and server code in Vite][server-client-splitting-decision-doc].

### vite-env-only

In the interest of speed, Vite lazily compiles each file in isolation.
Out of the box, Vite assumes any file referenced by client code is fully client-safe.

Remix automatically handles the removal of `loader`, `action` and `headers` exports from route files, ensuring they are always safe for the browser.
But what about non-Remix exports? How do we know which of these to remove from the browser build — and not just from routes, but from any module in your project?

For example, what if you wanted to write something like this?

```tsx
import { db } from "~/.server/db";

// This export is server-only ❌
export const getPosts = async () => db.posts.findMany();

// This export is client-safe ✅
export const PostPreview = ({ title, description }) => (
  <article>
    <h2>{title}</h2>
    <p>{description}</p>
  </article>
);
```

In this file’s current state, Remix would throw a compile-time error due to the use of a `.server` module on the client.
This is a good thing! You definitely don’t want to leak server-only code to the client.
You could fix this by splitting server-only code into its own file, but it’d be nice if you didn’t have to restructure your code if you didn’t want to — especially if you’re migrating an existing project!

This problem isn’t specific to Remix.
It actually affects any full-stack Vite project, so we wrote a standalone Vite plugin called [vite-env-only] to solve it.
This plugin lets you mark individual _expressions_ as server-only or client-only.

For example, when using the `serverOnly$` macro:

```tsx
import { serverOnly$ } from "vite-env-only";

import { db } from "~/.server/db";

export const getPosts = serverOnly$(async () => db.posts.findMany());

export const PostPreview = ({ title, description }) => (
  <article>
    <h2>{title}</h2>
    <p>{description}</p>
  </article>
);
```

On the client, this becomes:

```tsx
export const getPosts = undefined;

export const PostPreview = ({ title, description }) => (
  <article>
    <h2>{title}</h2>
    <p>{description}</p>
  </article>
);
```

**It’s worth reiterating that this is a separate Vite plugin and not a feature of Remix.** It’s completely up to you whether you prefer to use `vite-env-only`, split your server-only code into separate files, or even bring your own Vite plugin.

For more information, check out our [documentation on splitting up client and server code][splitting-client-server-docs].

## `.css?url` imports

From the very beginning, Remix has provided an [alternative model for managing CSS imports][regular-css-imports].
When importing a CSS file, its URL is provided as a string for rendering in a `link` tag:

```tsx
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "~/styles/dashboard.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];
```

While Vite has supported [importing static assets as URLs][vite-url-imports] for a long time now, this did not work for CSS files if they required any processing such as [PostCSS][vite-postcss] (including [Tailwind]), [CSS Modules][vite-css-modules], [CSS preprocessors][vite-css-preprocessors] etc.

With the recent release of [Vite v5.1.0][vite-5-1-0], full CSS support is now possible via the `.css?url` import syntax:

```tsx
import styles from "~/styles/dashboard.css?url";
```

## Cleaner build output

The old Remix compiler built the client and server into separate directories that could be configured independently.
By default, the output directories were `public/build` for client assets and `build` for the server.
It turned out that this structure conflicted with [Vite’s public directory][vite-public-directory].

Since Vite copies files from `public` into the client build directory, and Remix’s client build directory was nested within the public directory, some consumers found their public directory being recursively copied into&nbsp;itself&nbsp;🫠

To fix this, we had to rearrange our build output a bit.
Remix Vite now has a single top-level `buildDirectory` option that defaults to `"build"`, resulting in `build/client` and `build/server` directories.

The funny thing is that even though we only implemented this change to fix a bug, we actually much prefer this structure.
And based on the feedback we received, so did our early adopters!

## More than just a Vite plugin

Our earliest adopters ran the Vite CLI directly — `vite dev` for local development and `vite build && vite build --ssr` to build for production.
Due to the lack of a custom wrapper around Vite, our initial unstable release post mentioned that Remix was now “just a Vite plugin”.

However, with the introduction of server bundles, we were unable to hang onto this approach.
When using the `serverBundles` option there would now be a dynamic number of server builds.
We had assumed that we’d be able to define multiple inputs and outputs to Vite’s `ssr` build but this turned out not to be the case, so Remix needed a way to orchestrate the entire build process.
The Vite plugin also now provides a new `buildEnd` hook so you can run your own custom logic once the Remix build has finished.

We’ve kept as much of our old architecture as possible by maximizing the amount of code in our Vite plugin (and we’re glad we did!), and added `remix vite:dev` and `remix vite:build` commands to the Remix CLI.
In Remix v3, these commands will become the default `dev` and `build` commands.

So while we’re no longer “just a Vite plugin”, it’s fair to say that we’re still _mostly_ just a Vite&nbsp;plugin&nbsp;🙂

## Next steps

Now that Remix Vite is stable, you’ll start to see our documentation and templates moving over to Vite by default.

Just like with our initial unstable release, we have a [migration guide][remix-vite-migration] for those of you looking to move your existing Remix projects over to Vite.

Rest assured that the old Remix compiler will continue to work in Remix v2.
However, from now on all new features and improvements that require compiler integrations will only be targeting Vite.
In the future Vite will be the only official way to build Remix apps, so we encourage you to start migrating as soon as possible.

If you have any feedback for us along the way, please reach out.
We’d love to hear from you!

## Thank you

Thank you to all of our early adopters in the Remix community for providing feedback, raising issues and submitting pull requests.
We couldn’t have come this far without you.

We’d also like to extend an extra special thank you to [Hiroshi Ogawa][hiroshi-ogawa], an outside contributor who landed an astounding [25 pull requests][hiogawa-prs] into Remix&nbsp;Vite&nbsp;🔥

And as always, thank you to the Vite team for providing such an amazing tool for us to build on top of.
We’re excited to see where we can take it together.

💿⚡️🚀

[vite]: https://vitejs.dev
[remix-vite-migration]: https://remix.run/docs/future/vite#migrating
[remix-vite-release]: ./remix-heart-vite
[remix-vite-issues]: https://github.com/remix-run/remix/issues?q=is%3Aissue+is%3Aclosed+label%3Avite+closed%3A%3C2024-02-21
[remix-vite-pull-requests]: https://github.com/remix-run/remix/pulls?q=is%3Apr+is%3Amerged+label%3Avite+closed%3A%3C2024-02-21
[remix-run]: https://remix.run
[kentcdodds.com]: https://kentcdodds.com
[shop.app]: https://shop.app
[react-router]: https://reactrouter.com
[spa-mode]: https://remix.run/docs/future/spa-mode
[react-router-basename]: https://reactrouter.com/en/main/router-components/router
[remix-on-vercel]: https://vercel.com/docs/frameworks/remix
[remix-vercel-serverless]: https://vercel.com/docs/frameworks/remix#serverless-functions
[remix-vercel-edge]: https://vercel.com/docs/frameworks/remix#edge-functions
[vercel-remix-fork]: https://www.npmjs.com/package/@vercel/remix-run-dev
[vercel-remix-builder]: https://github.com/vercel/vercel/blob/main/packages/remix/src/build.ts
[server-bundles]: https://remix.run/docs/future/server-bundles
[nathan-rajlich]: https://n8.io
[cloudflare-pages]: https://pages.cloudflare.com
[wrangler]: https://developers.cloudflare.com/workers/wrangler
[presets]: https://remix.run/docs/future/presets
[vite-public-directory]: https://vitejs.dev/guide/assets.html#the-public-directory
[vite-base]: https://vitejs.dev/config/shared-options.html#base
[remix-public-path]: https://remix.run/docs/en/main/file-conventions/remix-config#publicpath
[remix-basename-discussion]: https://github.com/remix-run/remix/discussions/2891
[vite-env-only]: https://github.com/pcattori/vite-env-only
[server-client-splitting-decision-doc]: https://github.com/remix-run/remix/blob/main/decisions/0010-splitting-up-client-and-server-code-in-vite.md
[splitting-client-server-docs]: https://remix.run/docs/future/vite#splitting-up-client-and-server-code
[regular-css-imports]: https://remix.run/docs/styling/css
[vite-postcss]: https://vitejs.dev/guide/features#postcss
[tailwind]: https://tailwindcss.com
[vite-css-modules]: https://vitejs.dev/guide/features#css-modules
[vite-css-preprocessors]: https://vitejs.dev/guide/features#css-pre-processors
[vite-url-imports]: https://vitejs.dev/guide/assets#importing-asset-as-url
[vite-5-1-0]: https://vitejs.dev/blog/announcing-vite5-1
[hiroshi-ogawa]: https://github.com/hi-ogawa
[hiogawa-prs]: https://github.com/remix-run/remix/pulls?q=is%3Apr+is%3Amerged+label%3Avite+closed%3A%3C2024-02-21+author%3Ahi-ogawa
[wrangler-getplatformproxy]: https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy
[vite-runtime-api]: https://vitejs.dev/guide/api-vite-runtime#vite-runtime-api
[remix-vite-cloudflare]: https://remix.run/docs/future/vite#cloudflare
