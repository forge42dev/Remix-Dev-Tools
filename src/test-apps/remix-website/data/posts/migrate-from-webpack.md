---
title: Migrate from Webpack to Remix
summary: Apps that depend on Webpack loaders and plugins weren't able to incrementally migrate to Remix. Until now!
date: 2022-11-22
image: /blog-images/headers/webpack.png
imageAlt: "webpack and remix logos"
authors:
  - Pedro Cattori
---

Today, we're excited to share a way for Webpack-based apps to incrementally migrate to Remix. We've created an example of a Webpack-based Remix compiler and dev server so that you can use all your Webpack loaders and plugins from day one of the migration.

[Webpack Compiler for Remix Demo](https://github.com/remix-run/remix-webpack-demo)

## Background

A while back we wrote a [guide for migrating your React Router apps to Remix](https://remix.run/docs/en/v1/guides/migrating-react-router-app). While the JavaScript parts were straightforward, some Webpack loaders and plugins change the semantics of JavaScript and aren't compatible with the Remix compiler, turning an incremental migration into a nearly impossible task. The biggest category of which are the various CSS solutions that change the semantics of JavaScript module imports that don't work in Remix.

We want the path from your React Router app to Remix to be as smooth as possible, this demo should help pave the way a bit farther.

Side note for CSS, we are actively working to support more of the popular patterns directly in the Remix compiler, but there are nuances and trade-offs we're working through to ensure we don't kill the performance-by-default nature of Remix. (Also, you may have noticed Mark Dalgleish, the creator of CSS modules and Vanilla Extract [recently joined our team](https://twitter.com/markdalgleish/status/1587519372771217409).)

## Webpack-based Remix compiler is for migrations

To be clear, the Webpack-based Remix compiler is **designed for enabling incremental migrations to Remix** not a long-term development workflow.

The idea is that you can get up and running immediately with the Webpack-based Remix compiler and then migrate each route in isolation. As you do so, you can remove that route's dependence on non-standard Webpack loaders. That way, when you've migrated every route to Remix, you can switch over to the official Remix compiler and get the benefits of its sub-second builds.

If you aren't actively migrating away from Webpack, then we do not recommend that you use the Webpack-based Remix compiler. The Webpack-based Remix compiler is not guaranteed to support all current and/or future Remix functionality.

## Demo repository + migration guide

To see this all in action, check out our [Remix + Webpack demo repository](https://github.com/remix-run/remix-webpack-demo). You can find [instructions in the README](https://github.com/remix-run/remix-webpack-demo#setup) for running the demo app, but more importantly you can also find our [migration guide for Webpack apps](https://github.com/remix-run/remix-webpack-demo/blob/main/docs/migration-guide.md).

You're app might not depend on any incompatible Webpack loaders, so try doing the migration using the [standard migration guide](https://remix.run/docs/en/v1/guides/migrating-react-router-app) first if you aren't sure. If you run into any issues when [replacing your bundler with Remix](https://remix.run/docs/en/v1/guides/migrating-react-router-app#replacing-the-bundler-with-remix), then you'll know that the Webpack migration guide is worth checking out.
