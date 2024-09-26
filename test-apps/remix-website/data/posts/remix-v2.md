---
title: Remix v2
summary: The second major release of Remix is stable today.
date: 2023-09-15
image: /remix-v1.jpg
imageAlt: "The Remix logo"
authors:
  - Michael Jackson
---

We are excited to announce that after nearly 2 years of sustained effort since releasing Remix version 1 — 19 minor releases, over 100 patch releases, and thousands of closed issues and pull requests — we are releasing Remix v2 into the world today.

Back [in March we discussed at length](https://remix.run/blog/future-flags) our views on semantic versioning and building stable software, and described our approach to moving Remix forward without causing you to have to rewrite your app when we release a new major version. Today we are making good on that promise. If you have a Remix v1 app with all future flags enabled, you have a nearly seamless upgrade to v2 by simply dropping those flags from your Remix config. Of course, this is a major version so we are also taking the opportunity to bump a few of our main dependencies (notably, React 18 and Node 18).

For a comprehensive walkthrough of things you will need to upgrade, please refer to our [guide on upgrading to v2](https://remix.run/docs/en/main/start/v2).

We want you to be confident that the software you're building your business on isn't going to pull the rug out from under you next year. Another way to think about it: if you've been using the future flags in Remix v1, you already had access to many of the features in Remix v2 months ago. This is an iterative software development lifecycle we have learned from many wise voices over the years, for which we are grateful. And Remix v3 will be developed in the same way. Now that v2 is shipped, you can expect v3 features to show up behind future flags in the coming months well in advance of a stable/final v3 release.

## Highlights

In case you haven't been following along, here are some of the highlights we've shipped in v1:

- In [v1.8](https://github.com/remix-run/remix/releases/tag/remix%401.8.0) and [v1.10](https://github.com/remix-run/remix/releases/tag/remix%401.10.0) we aligned Remix with React Router v6. When we started working on Remix we promised that it would make React Router better. This release really closed the loop on that promise and aligned both libraries to use the same underlying dependency.
- In [v1.11](https://github.com/remix-run/remix/releases/tag/remix%401.11.0) we shipped `defer` which we affectionately refer to as "promises over the wire". Now you can put the spinners back in your Remix app if you really missed having them! 😜
- Also in [v1.11](https://github.com/remix-run/remix/releases/tag/remix%401.11.0) we added "flat" routing, which simplifies doing nested layouts without requiring nested directories. This is the default in v2
- In [v1.13](https://github.com/remix-run/remix/releases/tag/remix%401.13.0) and [v1.16](https://github.com/remix-run/remix/releases/tag/remix%401.16.0) we shipped much improved support for various CSS strategies in Remix including PostCSS, CSS modules, Vanilla Extract, and CSS side-effect (global) imports.
- In [v1.14](https://github.com/remix-run/remix/releases/tag/remix%401.14.0) and [v1.18](https://github.com/remix-run/remix/releases/tag/remix%401.18.0) we shipped a new dev server that does both hot module reloading (HMR) and hot data reloading (HDR). The new dev server is the default in v2.

Additionally, one of the major highlights we are shipping in v2 is [a brand new `create-remix` CLI experience](https://github.com/remix-run/remix/pull/6887).

For a complete list of everything that changed in v2, please refer to [the release notes](https://github.com/remix-run/remix/releases/tag/remix%402.0.0).

## What about RSC?

This really deserves its own post, but I know some of you are probably wondering what Remix is planning to do with regards to React Server Components (RSC). It's a great question, and if you're reading this far you probably have it, so I'll do my best to give you some sense of where we're at.

The tl;dr is that we are optimistic about adding support for RSC in Remix v3 and we are anxious to do our part in the effort to prove the technology in multiple frameworks. The capabilities of RSC are interesting, but Remix v2 relies on current stable React features, which at the time of this writing doesn't include RSC. When RSC is stable, you can expect that Remix will support it.

However, "supporting RSC" is quite different from supporting other React features that we've seen. For example, when hooks showed up in 2018, they gave us a different way to build components, but they had relatively little impact on bundling and application deployment. RSC, however, requires a much deeper integration.

We are very encouraged by some of the changes we've seen in RSC since we initially evaluated it. In particular, RSC `async` components look a lot like a Remix `loader` married a component and decided to ditch that obnoxious 3rd wheel, `useLoaderData`. So you can bet data loading will look somewhat different in Remix v3. Our hope is you'll just be moving a bunch of your `loader` code down into your new `async` components (but watch out for data dependency waterfalls! Did I already mention this should be its own post? It really should...).

At Remix Conf earlier this year we hosted [a panel discussion](https://www.youtube.com/watch?v=WiEtFPYGgbM) with some of the core React team where we discuss RSC and how we're working together. We are anxious to help in any way we can to get this technology ready for stable release.

Aaaaaand that's a wrap for this post! Seriously, I don't know why you're even still here 😅

Go [read the upgrade guide](https://remix.run/docs/en/main/start/v2)!
