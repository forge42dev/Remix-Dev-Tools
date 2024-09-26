---
title: Remix and “The Edge”
summary: “The edge” isn’t just about static assets anymore. It’s increasingly becoming a place for dynamic assets resulting from compute. Remix is taking full advantage of this next generation of edge computing.
date: 2022-05-13
image: /blog-images/headers/remix-and-the-edge.png
imageAlt: An illustration of a gauge with a dial that can go from “Static” on the left to “Dynamic” on the right, accompanied by the Remix logo.
authors:
  - Jim Nielsen
---

There’s a lot in the air around CDNs and “the edge”. Traditionally, the edge has been perceived as a distributed network for storing and delivering static assets fast, while anything dynamic still requires compute _somewhere_ whether on the client (in the form of client-side JS talking to APIs) or the server (an application server, lambda function, etc.).

But that is changing. “The edge” isn’t just about static assets anymore. It’s increasingly becoming a place for dynamic assets which require compute. Chris Coyier talks about this in his post: “[It doesn’t much matter how CDNy your Jamstack site is if everything important happens from a single-origin server. Edge functions are probably part of the solution.][chris-coyier]”.

> Static files on “the edge” is cool and all, but ya know what’s even cooler? Actually _doing stuff_ on the edge.

Kent also talked about “the edge” and what’s coming next in [his talk at Reactathon][reactathon-kent].

[![Screenshot from the video Kent’s talk, showing Kent and his title slide with the words “Shipping to the Edge”][img-reactathon-kent]][reactathon-kent]

In this post, we’ll take a closer look at the different ways of delivering content on the web, why “the edge” exists, and how it’s evolving to better deliver great user experiences on the web (and, of course, how Remix takes advantage of it all).

## First: Server Side Rendering (SSR)

In the basic form of this model, you have a single-origin server which serves your content (dynamic or static), to everyone upon request.

![Illustration depiciting two different users connecting to the same server across the world and being served the same resource.][img-ssr]

While this model has its advantages, it’s prone to performance issues because 1) there’s only one server serving everyone, and 2) it’s not distributed around the world (speed is determined, in part, by the user’s geographic proximity to your server).

## Enter: Static Site Generation (SSG)

SSG promises to make SSR faster by getting rid of the origin server (for static content) and putting everything on a distributed network of computers around the world (also known as a CDN). This makes accessing content collectively faster because content is spread around the world for faster retrieval.

![Illustration depiciting two different users across the world connecting to CDN nodes close to their geographic location and being served the same resource.][img-ssg]

But what about the dynamic stuff you were doing in SSR? If content on your site changes, the conventional wisdom is to regenerate the entire site and push it anew to the CDN.

And what about user-specific content? For that, you’ll need an escape hatch from this mode of “static content retrieval” and _some kind of server_ to generate this user-specific content.

## Enter: Client Side Rendering (CSR)

A huge part of static site generation and the JAMstack is the “A” part: APIs. This answers the question of: how do I generate and retrieve dynamic content tailored to individual users?

In the SSG model, this is commonly done by delivering a static, empty shell for your content from a CDN. This shell, which is initially the same for all users, generally displays a loader and contains instructions on how to retrieve and render user-specific content.

![Illustration depiciting two different users across the world connecting to CDN nodes close to their geographic location and being served the same resource which is a document with a loading spinner.][img-csr-1]

Hello spinners! Each client is then required to go fetch their own, unique data which is likely on an origin server somewhere in the world (that may connect to a nearby database) for personalized or dynamic content.

![Illustration depiciting two different users across the world bypassing CDN nodes close to their geographic location and instead connecting to the same origin server far from their geographic location to be served unique content.][img-csr-2]

Do you see the problem? The CDN is marvelous at delivering content uniform to all users and requests. But the compute and data retrieval required to deliver user-specific content necessitates a server somewhere and therefore bypasses the distributed value-add of your CDN.

In other words, if the _content_ of your _content delivery network_ is user-specific, it likely isn’t coming from a network of computers distributed around the world. Rather, it’s likely coming from an origin server (or lambda function or the like) _somewhere specific_ in the world. Only the shell of your app, which is generic across all your users, can be delivered by your CDN and take advantage of its benefits (at least the empty shell renders fast, right?)

## Enter: ISR, DPR, and [Insert Acronym Here]

[Incremental static regeneration][isr] (ISR), [distributed persistent rendering][dpr] (DPR), and any others we might come up with, are meant to solve some of the problems described above on a case-by-case basis.

But the thing about these alternative options and frameworks is that they present an illusion of choice. Fundamentally, you’re still choosing SSR or CSR (with their associated tradeoffs) _for your entire site_ and then getting some page-by-page escape hatches (ISR, DPR, lambdas, etc.)

## Enter: Remix

Remix doesn’t require you consider and buy-in to the trade-offs of these countless escape hatches. It allows you to decide on a page-by-page basis (and easily change your mind later) what level of dynamism you want for any given resource (or should I say route, as [Remix is coming to a react-router near you][remixing-router]).

Remix gives you a conceptual lever you can pull to implement the level of dynamism you want for any given page. And if that ever changes, just push or pull your lever. You can even control this lever at runtime depending on data, user, or even A/B testing!

- About page? Mostly static (same content for every user, changes infrequently). Pull the lever close to “static”.
- User profile? Moderately dynamic (different for every user, changes infrequently). Push the lever towards the middle, between static and dynamic.
- User feed? Highly dynamic (different for every user, changes by the minute). Push the lever all the way up towards dynamic.

![Illustration of a gauge with a dial. The gauge reads “Static” on the left and “Dynamic” on the right, with labled points on the spectrum between those two extremes for SSG, ISR, CSR, and SSR, each of which has a line through them to show they’re not needed. The Remix logo is shown below the gauge.][img-lever]

Some smart guy said, “Give me a lever and I’ll move the world”. Remix took that idea and ran with it. Now you have a lever to deliver any web page across the spectrum of dynamism. And with the next generation of “the edge”, you can do it all over the world fast.

### Remix and NextGen “Edge”

The next generation of “The Edge” — technologies like [Deno deploy][deno-deploy], [Cloudflare Workers][cloudflare-workers], and (increasingly) many others — promise to combine static-content CDNs with dynamic-content servers, so you can deliver static assets and dynamic content requiring compute from the same network—think traditional SSR but distributed, as if an origin server and a CDN had a baby.

“The edge” can either have the requested content, or do the compute required to get the requested content and cache it, so everything renders fast for everyone all over the world. No more spinners!

![Illustration depiciting two different users across the world connecting to next generation edge nodes, which are a visual combination of a traditional CDN node and an origin server, resulting in each user retrieiving tailored content from a server in close proximity to their geographic location.][img-edge]

Combine this kind of computing network with Remix and now you can deliver any level of dynamism you want, for any given page, spread out across a world-wide network of computing — all in service of a great user experience: personalized content fast.

## And One More Thing…

Streaming on the edge! But that’s a blog post for another day. If you can’t wait, go watch [Ryan’s talk at Reactathon][reactathon-ryan].

[chris-coyier]: https://chriscoyier.net/2022/05/04/it-doesnt-much-matter-how-cdny-your-jamstack-site-is-if-everything-important-happens-from-a-single-origin-server-edge-functions-are-probably-part-of-the-solution/
[reactathon-kent]: https://youtu.be/V5hPAl1q7vo?t=2546
[img-reactathon-kent]: /blog-images/posts/remix-and-the-edge/kent-talk.jpg
[reactathon-ryan]: https://youtu.be/Ck-e3hd3pKw?t=9274
[img-ssr]: /blog-images/posts/remix-and-the-edge/ssr.png
[img-ssg]: /blog-images/posts/remix-and-the-edge/ssg.png
[img-csr-1]: /blog-images/posts/remix-and-the-edge/csr-1.png
[img-csr-2]: /blog-images/posts/remix-and-the-edge/csr-2.png
[img-edge]: /blog-images/posts/remix-and-the-edge/edge.png
[img-lever]: /blog-images/posts/remix-and-the-edge/static-to-dynamic.png
[isr]: https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
[dpr]: https://www.netlify.com/blog/2021/04/14/distributed-persistent-rendering-a-new-jamstack-approach-for-faster-builds/
[remixing-router]: remixing-react-router
[deno-deploy]: https://deno.com
[cloudflare-workers]: https://workers.cloudflare.com
