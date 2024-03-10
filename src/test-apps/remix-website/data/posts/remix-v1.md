---
title: Remix v1
summary: Remix is now production ready and completely free and open source.
date: 2021-11-22
image: /remix-v1.jpg
imageAlt: "The Remix logo"
authors:
  - Michael Jackson
---

Today we are happy to release Remix v1 into the world.

This release comes after over 20 prereleases and 18 months of development, which included [the release of React Router v6 earlier this month](https://remix.run/blog/react-router-v6). We invite you to [check out the source code](https://github.com/remix-run/remix) and star the repo.

We'll be [talking a lot more about Remix on our livestream today](https://www.youtube.com/watch?v=wsJaUjd1rUo) (hit the bell if you want a reminder!) and [chatting about it on Discord](https://discord.com/events/770287896669978684/910743267619004446), so be sure to tune in for a more in-depth look.

We've been so heads-down on getting the product right that we haven't done a whole bunch of marketing yet. I know that's been a little annoying for some (bUt HoW IS it dIFFerenT fROm NExt??), but we believe that focusing relentlessly on the product is the right call, even if our marketing temporarily suffers. We've been in a tight feedback loop with many paying customers who participated in our early supporter preview, many of whom have already launched production sites using Remix. And we have a smart, friendly, engaged core community of Remix users. We couldn't be more pleased with the kinds of conversations happening daily on [our Discord server](https://rmx.as/discord).

So what exactly is Remix? Well, it honestly depends on who you ask 😅

If you ask me, Remix is an edge-first web framework that embraces JavaScript runtimes running as close as possible to your users. Remix already runs natively on Cloudflare Workers and plans for supporting Deno Deploy and even "offline" apps are already underway. Instead of relying on static prerendering to deliver a fast time to first byte (TTFB) and showing a page with a bunch of spinners while you load data, [Remix is built to run at the edge](https://remix-cloudflare-demo.jacob-ebey.workers.dev/). Our friend [Sunil calls it "disgustingly fast"](https://twitter.com/threepointone/status/1460607551712727048). This is a fundamental shift in web architecture that Remix wholeheartedly embraces. You can expect to hear a LOT more from us about this in the coming months.

If you ask Ryan, Remix is all about fine tuning the details of the user experience. It's [all over our new website](https://remix.run); things like declarative preloading of HTML resources, managing focus for accessibility, handling race conditions, and restoring the scroll position when a user navigates back on a client-side route transition. He will literally talk your ears off about the power of nested layouts and how it affects everything from what you see in the network tab to contextual data loading and error handling.

If you ask Kent, he'll probably tell you all about how Remix was [the biggest productivity booster he used](https://twitter.com/kentcdodds/status/1445779956718465033) when building his new website and how leaning on standard web APIs like `Request`, `Response`, `FormData` and others help increase understanding and make your knowledge more portable to other stacks as well.

If you ask a designer they'll probably be stoked about how Remix automatically loads and unloads the right stylesheets at the right time, which is actually really useful when scaling a website. If you ask a web perf advocate, they will probably be excited about how everything in Remix works regardless of whether or not you have any JavaScript on the page. Remember "progressive enhancement"? It's a viable strategy in Remix.

So yeah, Remix is a lot of things to a lot of different people. It's a true full stack framework. What does it mean to you?

We are excited to share more of what we've been working on over the coming weeks. But that's enough from me for now. You probably just wanna [dig in and get started already](https://remix.run/docs)!

Have fun!
