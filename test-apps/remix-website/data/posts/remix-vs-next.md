---
title: Remix vs Next.js
summary: An objective comparison between Remix and Next.js
featured: false
date: 2022-01-11
image: /blog-images/headers/remix-vs-next.jpg
imageAlt: Remix and Next.js Logos
authors:
  - Ryan Florence
---

Easily the biggest question we get asked is something like:

> How is Remix different from Next.js?

It appears we have to answer this question! We'd like to address it directly and without drama. If you're a fan of Remix and want to start tweeting smug reactions to this article, we kindly ask that you drop the smugness before hitting the tweet button 🤗. A rising tide lifts all boats. We've been friends with folks at Vercel long before Vercel was founded. They are doing great work and we respect the work they do!

But make no mistake, **we think Remix has a better set of tradeoffs than Next.js**. <small>(Otherwise we wouldn't have built it...)</small>

We encourage you to read this entire article. There is a lot of nuance in this conversation that's left un-captured in the shiny graphs and animations. By the end, hopefully you'll consider Remix for your next project (no pun intended 😂).

## tl;dr

- Remix is as fast or faster than Next.js at serving static content
- Remix is faster than Next.js at serving dynamic content
- Remix enables fast user experiences even on slow networks
- Remix automatically handles errors, interruptions, and race conditions, Next.js doesn't
- Next.js encourages client side JavaScript for serving dynamic content, Remix doesn't
- Next.js requires client side JavaScript for data mutations, Remix doesn't
- Next.js build times increase linearly with your data, Remix build times are nearly instant and decoupled from data
- Next.js requires you to change your application architecture and sacrifice performance when your data scales
- We think Remix's abstractions lead to better application code

## Background

We figured the fairest way to compare the frameworks would be to take a Next.js example app that the Vercel team wrote themselves. Since they wrote it, the decisions they made should reflect how they intend you to build your app. It should also show off the features the Vercel team is most proud of.

We ported the _Commerce Example_ from the Next.js [examples page][next-examples]. It has a handful of real world features we liked, and seems to be the one they put the most effort into.

- Initial page load is critical for ECommerce
- Dynamic data on the search page
- Data mutations with the shopping cart
- Ability to integrate with multiple providers that illustrates how the frameworks help you abstract

We actually built two versions:

- **Minimal Port** - We simply copy/pasted/tweaked the Next.js code to run on Remix instead of Next.js. This is deployed to Vercel just like the Next.js Demo. This is a great comparison of frameworks because everything but the framework is the same.
- **Rewrite** - The two frameworks don't actually have a lot of API overlap and Remix can run on different infrastructure than Next.js. To really exercise Remix's design, we rewrote the example into idiomatic Remix, and even built a quick image optimization route into the app so it's 100% Remix.

Note that this app doesn't get to exercise everything we think is cool about Remix (like nested routes!). Once we answer this question, we can move on to just talking about Remix, so stay tuned!

Additionally, we shared this post with Vercel before publishing. Turns out their example was running on an older version of Next.js, they updated it, so we took the time to rework this to compare to their latest example.

## Seriously, We Like Vercel

We consider them friends and even partners as Vercel is an excellent deployment target for Remix. I've deployed Remix apps to pretty much every hosting service I've ever heard of. Vercel's developer experience is easily my favorite. The "Develop, Preview, Ship" mantra has real effects. Just this morning [@gt_codes](https://twitter.com/gt_codes) and I were trying to figure out a production bug and having every preview deployment available with a little screenshot of each one helped us find the bad commit in seconds. It's good stuff.

It's a funny relationship now because we're not just friends and technology partners, we're framework competitors! So, to our friend, partner, and competitor Vercel, Lee put the motivation behind this article wonderfully:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">When there&#39;s competition in DevTools, developers win:<br><br>◆ Svelte is pushing React<br>◆ Remix is pushing Next.js<br>◆ Prisma is pushing ORMs<br>◆ Deno is pushing Node.js<br>◆ Supabase is pushing Firebase<br>◆ esbuild / SWC are pushing JS tooling<br>◆ Bun is pushing SWC<br><br>What else?</p>&mdash; Lee Robinson (@leeerob) <a href="https://twitter.com/leeerob/status/1465702417513680897?ref_src=twsrc%5Etfw">November 30, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Please read this post with that context. Let's get pushing!

## Self-Descriptions

I think you can tell a lot about something by how the people who built it describe it. <small>(If you follow me on twitter you'll know I've been iterating laboriously over ours!)</small>

Next.js describes itself as:

> The React Framework for Production. Next.js gives you the best developer experience with all the features you need for production: hybrid static & server rendering, TypeScript support, smart bundling, route pre-fetching, and more. No config needed.

Next.js is built by Vercel. Looking at the GitHub repo for the Vercel platform it states:

> Vercel is a platform for static sites and frontend frameworks, built to integrate with your headless content, commerce, or database.

We describe Remix as:

> Remix is an edge native, full stack JavaScript framework for building modern, fast, and resilient user experiences. It unifies the client and server with web standards so you can think less about code and more about your product.

We'll leave it to you to contrast those descriptions.

## Home Page, Visually Complete

> Is Remix as fast as Next.js?

This is usually the first question people ask. Next.js often uses the phrase "performance by default" and they've got it in spades! Let's see how fast each app can render a "Visually Complete" page.

We ran the sites through [WebPageTest][wpt]. It's a great tool that generates the comparison gifs in this post. In every comparison, we gave each framework five runs and took the best one from each.

Above each comparison is a caption that links to the results that generated the animation. You are free to validate everything yourself by simply clicking "rerun test" on WebPageTest.com.

This first one was run from Virginia with a cable modem connection to the internet.

[<figcaption>Home Page, Virginia, Cable</figcaption>][wpt-virginia-cable]

![Remix loads in 0.7s, Next in 0.8s][wpt-virginia-cable-gif]

Before we say anything, let's acknowledge that all three versions are so dang fast it's not even worth comparing who is faster. It's a bit unfair to Next.js too, because the little animation of the cookie banner factors into "visually complete" and the Remix site doesn't have it. Let's look at it in slow motion:

[<figcaption>Home Page, Virginia, Cable, Slow-Mo</figcaption>][wpt-virginia-cable]

![Remix loads in 0.7s, Next in 0.8s][wpt-virginia-cable-gif-slow-mo]

Now we can see that Next.js is actually done 0.8s. Again, they are all fast. I also ran them all through the same test with a 3G network connection and it was the same story: all fast, all looked about the same.

✅ Remix is as fast as Next.js

## Why The Apps Are Fast

**Why Next.js is fast**: The homepage uses [Static Site Generation][getstaticprops] (SSG) with `getStaticProps`. At build time, Next.js pulls data from Shopify, renders a page to an HTML file and puts it in the public directory. When the site is deployed, the static file is now served at the edge (out of Vercel's CDN) instead of hitting an origin server at a single location. When a request comes in, the CDN simply serves the file. Data loading and rendering have already been done ahead of time so the visitor doesn't pay the download + render cost. Also, the CDN is distributed globally, close to users (this is "the edge"), so requests for statically generated documents don't have to travel all the way to a single origin server.

**Why the Remix port is fast**: Remix doesn't support SSG so we used the HTTP [stale-while-revalidate caching directive][swr] (SWR, not be consfused with Vercel's `swr` client fetching package). The end result is the same: a static document at the edge (even on the same CDN, Vercel's). The difference is how the documents get there.

Instead of fetching all of the data and rendering the pages to static documents at build/deploy time, the cache is primed when you're getting traffic. Documents are served from the cache and revalidated in the background for the next visitor. Like SSG, no visitor pays the download + render cost when you're getting traffic. If you're wondering about cache misses, we'll discuss that a little later.

SWR is a great alternative to SSG. Another thing that makes deploying to Vercel great is that their CDN supports it.

You might wonder why the Remix port isn't as fast as Next.js. Since Remix doesn't have built-in image optimization (yet), we just pointed the images at the Next.js app 🤫. The browser has to open a connection to both domains and this delays the images from loading by 0.3s (you can verify this on the [network waterfall][delayed-images]). If the images were self-hosted, it would be right there with the other two around 0.7s.

**Why the Remix rewrite is fast**: Instead of caching documents at the edge with SSG or SWR, this version _caches data at the edge_ in [Redis][redis]. In fact, it actually **runs the application at the edge too** with [Fly.io][fly]. Finally, it's got a quick image optimization [Resource Route][resource-route] that writes to a [persistent volume][volume]. It's basically its own CDN 😎.

This might have been difficult to build a few years ago, but the server landscape has changed significantly in the past few years and is only getting better.

## Loading Dynamic Pages

> How is Remix Different than Next.js?

This is the next question we get. There are a lot of differences in feature sets, but one major, architectural difference is that Remix doesn't rely on SSG for speed.

In practically every app, you will eventually hit a case that SSG can't support. For the application we're comparing here, it's the search page.

The constraint is that users can submit an infinite number of queries. With the universe's current constraints on space and time, you can't statically generate infinite pages. SSG is off the table.

[<figcaption>Search Page, Cached, Virginia, Cable</figcaption>][wpt-virginia-search-cable]

![Remix in 0.8s, Next.js 1.9][wpt-virginia-search-cable-gif]

Because SSG doesn't scale to dynamic pages, Next.js switched to clientside data fetching from the user's browser. Taking a peak at the network waterfall will tell us why it's 2.3x slower than Remix.

<div class="flex w-full gap-4">
  <div class="w-1/2">
    <figcaption class="text-center bold text-base">Remix Search</figcaption>
    <a data-noprefetch href="/blog-images/posts/remix-vs-next/wpt-search-remix-waterfall.png"><img src="/blog-images/posts/remix-vs-next/wpt-search-remix-waterfall.png" /></a>
  </div>
  <div class="w-1/2">
    <figcaption class="text-center text-base">Next.js Search</figcaption>
    <a data-noprefetch href="/blog-images/posts/remix-vs-next/wpt-search-next-waterfall.png"><img src="/blog-images/posts/remix-vs-next/wpt-search-next-waterfall.png" /></a>
  </div>
</div>

The Remix apps are completely done before the Next.js app even starts loading images. Perhaps the most important thing to get right in web performance is parallelizing the network waterfall. At Remix, we are fanatical about it.

**Why Next.js is slower**: Next.js introduced what we call a "network waterfall request chain". Because SSG can't be used here, the app is fetching the search results from the user's browser. It can't load images until it has fetched data, and it can't fetch data until it has loaded, parsed, and evaluated the JavaScript.

Fetching in the client also means more JavaScript over the network, and more time for parse/eval. Sometimes we forget about parse/eval, but you can see the JS execution on the 15th request took longer than the document did to download! Next.js is sending 1.5x more JavaScript than Remix with 566 kB vs. 371 kB unpacked. Over the network it's 50 kB more compressed (172 kB vs. 120 kB).

Doing more work in the browser starts to add up. Look at the bottom rows that show CPU utilization and the browser's main thread activity. The Next.js app is quite busy with a big red "long task" slowing things down.

**Why Remix is still as fast as the homepage**: Neither Remix example actually had to talk to the Shopify API in the request. While SSG can't cache the search page, the Remix versions can: with either SWR or Redis. When you have a single, dynamic way to generate pages, you can tweak your caching strategy without changing your application code. The result is SSG speed on commonly visited pages. The `"/search"` page will likely be primed, as well as the categories on the left nav and common queries like "tshirt".

## Dynamic Page Cache Miss

> Yeah, but what about a cache miss?

You're probably not going to believe me on this one, and I have no way to prove that our cache was empty, but here is a cache miss in Remix <small>(cross my heart, swear to die, stick a needle in my eye)</small>.

[<figcaption>Search Page, Empty Cache, Virginia, Cable</figcaption>][wpt-virginia-search-miss]

![Remix loads in 3.9s, Next in 8s][wpt-virginia-search-miss-gif]

Actually, I lied. That's a cache hit for the Remix Rewrite. The [cache miss was faster][wpt-virginia-search-miss-fast] (0.6s 🤭). I _really_ didn't think you'd believe me, so I put the slower cache hit in the graphic 😅

> Impossible!

Turns out the Shopify API is quite fast.

Since the Next.js app is fetching directly from the browser to the Shopify API, we can look at the [network graph][shopify-api-is-fast] of the test and see that the request only took 224ms. It took longer for the browser to establish a connection with the API than to make the request! (They could speed that up with a `<link rel="preconnect" />` in their initial HTML.)

If the user's browser could make the request to Shopify that quickly, the Remix server can certainly do it faster. The user's connection to the cloud is always going to be slower than your server's, probably best to keep the data fetching there.

Bottom line is, caching is nearly pointless when using the Shopify API. Cache hits or misses will be virtually indistinguishable from each other.

This is best illustrated by slowing down the user's network and seeing what happens. Let's do another cache miss, this time from Hong Kong on a 3G connection.

[<figcaption>Search Page, Empty Cache, Hong Kong, 3G</figcaption>][wpt-hkg-search-3g]

![Remix loads in 3.1s, Next in 6.6s][wpt-hkg-search-3g-gif]

Next.js is now 3.5 seconds behind, even on a cache miss. What's up?

> You said the Shopify API was fast!

Next.js can't load images until it loads data, it can't load data until it loads JavaScript, and it can't load JavaScript until the document loads. The user's network is a multiplier for every single step in that chain 😫.

In Remix, the only chain is waiting for the document to be able to load the images. The Remix design of always fetching on the server removes the user's network as a multiplier everywhere else.

Remix can start fetching from Shopify immediately when a request is received. It doesn't have to wait for the browser to download the document and then the JavaScript. It doesn't matter how slow the user's network is, the fetch to the Shopify API on the server doesn't change and is probably under 200ms.

## Architectural Divergence

The user experience wasn't the only thing that took a hit when Next.js moved to fetching in the client. The app now has two different sets of abstractions for talking to Shopify: one set for SSG and another for the browser.

Architectural divergences like this bring up some major questions:

- Do you have to authenticate in the browser?
- Does the API support CORS?
- Does the API SDK even work in the browser?
- How do we share code between build and browser code?
- Is it okay to expose the API token in the browser?
- What permissions does our token that we just shipped to every visitor have?
- Can this function use `process.env`?
- Can this function read `window.location.origin`?
- How do I make a network request that works in both places?
- Can we cache these responses somewhere?
- Should we make an isomorphic cache object that works in both places and pass it in to the different data fetching functions?

<small>(omigosh I said isomorphic) <small>(that's orthogonal to this post) <small>(gah PROFUNCTOR OPTICS!)</small></small></small>

Let's answer these questions for Remix, where you only have to abstract the Shopify API on the server:

- Do you have to authenticate in the browser? (no)
- Does the API support CORS? (doesn't matter)
- Does the API SDK even work in the browser? (doesn't need to)
- How do we share code between build and browser code? (you don't have to)
- Is it okay to expose the API token in the browser? (don't need to)
- What permissions does our token that we just shipped to every visitor have? (you didn't!)
- Can this function use `process.env`? (yes)
- Can this function read `window.location.origin`? (no)
- How do I make a network request that works in both places? (however you want, it's not in the browser)
- Can we cache these responses somewhere? (sure, HTTP, redis, lru-cache, persistent volume, sqlite...)
- Should we make an isomorphic cache object that works in both places and pass it in to the different data fetching functions? (don't need to!)

The simpler these questions are to answer, the better your abstractions will be, resulting in simpler code to work with.

If the Next.js app moved away from client fetching, and used `getServerSideProps`, they would probably close the gap and have simpler answers to these questions. It's interesting to note that the Next.js docs [push you away](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props#when-should-i-use-getserversideprops) from server fetching and into SSG or client fetching often, though:

> If you do not need to pre-render the data, then you should consider fetching data on the client side.

They also [encourage client fetching](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props#fetching-data-on-the-client-side) for pages with user data, pushing you, again to more architectural divergence.

> [Client fetching] works well for user dashboard pages, for example. Because a dashboard is a private, user-specific page, SEO is not relevant

As we've seen here, server rendering is about better performance, too, not just SEO.

The fundamental difference here is that Next.js has four "modes" for getting data on the page:

- `getInitialProps` - called server and client side
- `getServerSideProps` - called server side
- `getStaticProps` - called at build time
- client fetching - called in the browser

Remix only has one: `loader`. It's easier to abstract around one thing that only runs in one place than four things that run in three places.

### The Cost of Architectural Divergence

Let's try to quantify the cost of this architectural divergence. Perhaps the most difficult development task of this app is abstracting the commerce back end. The app is designed in a way that you can plug anything into it: Shopify, BigCommerce, Spree, Saleor etc.

In the Next.js app, the Shopify integration lives in [this folder][next-shopify]. Running `cloc` on it today yields:

```
     101 text files.
      93 unique files.
       8 files ignored.

github.com/AlDanial/cloc v 1.92
---------------------------------------------------------------------
Language           files          blank        comment           code
---------------------------------------------------------------------
TypeScript            88            616           2256           5328
GraphQL                1           1610           5834           2258
Markdown               1             40              0             95
JSON                   2              0              0             39
JavaScript             1              1              0              7
---------------------------------------------------------------------
SUM:                  93           2267           8090           7727
---------------------------------------------------------------------
```

Almost 8,000 lines of code across nearly 100 files. I ran it for the other integrations and it's the same story. They're all approaching 100 files and hover around 10,000 lines of code. Nearly all of that code makes it to the browser, too.

Here is the [Remix integration with Shopify][remix-shopify].

- 1 file
- 608 lines of code
- None of it goes to the browser

This, right here, is the cost of architectural divergence. The Next.js abstractions have to anticipate, and participate in the build and the browser. The Remix abstraction is only on the server.

You might wonder if the two Shopify providers have the same feature sets, and maybe we're being deceptive. There is some code in many of them for authentication and wishlists, but the Shopify provider didn't use either one (but did have to export modules for them). Using the two websites they appear to have the same feature set. Regardless, if we did miss something, it would be hard to imagine it would take 7,000 lines of code to get there when the visible features in the app only took 1/10th of that.

Even if Next.js moved to `getServerSideProps` for the search page, they'd still need almost all of that code for the data mutation features, but I'm getting ahead of myself now!

## Edge Native

We talk a lot about "deploying to the edge". What does that mean? Here's another cache miss from Hong Kong, this time with a fast user network:

[<figcaption>Search Page, Empty Cache, Hong Kong, Cable</figcaption>][wpt-hkg-search-miss-cable]

![Remix loads in 3.9s, Next in 8s][wpt-hkg-search-miss-cable-gif]

This time we're going to talk about the difference between the two Remix apps. We already know the Next.js version is slower because of the network waterfall chains.

Both Remix apps fetch on the server, so why is the Remix port so far behind the Remix Rewrite?

The answer is simple: the Remix Port is running in a Vercel function, and Vercel's functions don't run your code at the edge, [they run in one region](https://vercel.com/docs/concepts/functions/regions#default-region), defaulting to Washington DC. That's pretty far away from Hong Kong!

This means the user has to get all the way from Hong Kong to Washington, DC, before the server can start fetching the data from Shopify. When the server is done, it has to send the document all the way back.

The Remix Rewrite is running in Washington DC, too, but it's also running in Hong Kong! That means the user has a very quick hop to the Remix server where everything is going to be faster.

It's like riding your bike to the train to get into town, instead of riding your bike the whole way.

🚲-----------------------------------------🏢<br/>
🚲-----🚊====🏢

You can see this play out in the network waterfall (as usual):

<div class="flex w-full gap-4">
  <div class="w-1/2">
    <figcaption class="text-center bold text-base">Remix Rewrite @ Edge</figcaption>
    <a data-noprefetch href="/blog-images/posts/remix-vs-next/wpt-hkg-search-rewrite-waterfall.png"><img src="/blog-images/posts/remix-vs-next/wpt-hkg-search-rewrite-waterfall.png" /></a>
  </div>
  <div class="w-1/2">
    <figcaption class="text-center text-base">Remix Port in US East</figcaption>
    <a data-noprefetch href="/blog-images/posts/remix-vs-next/wpt-hkg-search-port-waterfall.png"><img src="/blog-images/posts/remix-vs-next/wpt-hkg-search-port-waterfall.png" /></a>
  </div>
</div>

The infrastructure difference manifests in the first blue bar for the document. In the Remix Port, it's way bigger. That's the user riding their bike half way around the world in the Vercel function bike lane. In the Remix Rewrite, it got on the train and made it to the Shopify API and back much sooner.

This version runs on [Fly.io][fly] that can run Node.js servers in dozens of regions around the world. Remix doesn't depend on Node.js though. It can run in any JavaScript environment. In fact, it already runs in [Cloudflare Workers][cf-workers], which means you're running your code on [their 250 servers][cloudflare-network] distributed around the world. Can't get any closer to users than that!

This is why we say that Remix is "edge native". Next.js depends on Node.js so it's ability to deploy the edge is limited today.

We still have a lot of work to do in this area to make the developer experience better. We only officially support Node.js and Cloudflare right now, but we're actively working on Deno, and community members have Remix running on Fastly.

When you're using an "edge native" framework like Remix, you no longer have to decide which users get a faster experience. You can give every user a fast experience no matter where they are in the world.

The edge is what Remix was built for. As you can see, it's very promising. As we understand it, the Vercel team is working hard on deploying your apps to the edge, too. Remix is ready for it, we can't wait to try it out.

## Clientside Transitions

Both frameworks enable instant transitions with link prefetching, but Next.js only does this for pages created from SSG. The search page is out, again. <small>(maybe next time, sport)</small>

However, **Remix can prefetch any page because there was no architectural divergence for data loading.** Prefetching an unknowable, user-driven search page URL is not any different than prefetching a knowable product URL.

In fact, Remix prefetching isn't limited to just links, it can prefetch any page, at any time, for any reason! Check this out, prefetching the search page as the user types:

<figcaption>Search Input Prefetching, Fast 3G</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/prefetch-search.mp4" type="video/mp4" />
</video>

No spinners, no skeletons, instant user experiences, even on slow networks 🏎

This was super easy to do, too.

```tsx
import { Form, PrefetchPageLinks } from "@remix-run/react";

function Search() {
  let [query, setQuery] = useState("");
  return (
    <Form>
      <input type="text" name="q" onChange={(e) => setQuery(e.target.value)} />
      {query && <PrefetchPageLinks page={`/search?q=${query}`} />}
    </Form>
  );
}
```

Since Remix uses HTML's `<link rel="prefetch">` (instead of an in memory cache like Next.js) the browser actually makes the requests, not Remix. Watching the video you can see how the requests are cancelled as the user interrupts the current fetch. Remix didn't have to ship a single character of code for that top-notch handling of asynchrony. #useThePlatform ... or, uh, #reuseThePlatform 😎?!

## Data Mutations

This is where Remix and Next.js start to look completely different. Half of your app code is related to data mutations. It's time your web framework respects that.

**How mutations work in Next.js**: Next.js doesn't do anything for you here. `<button onClick={itsAllUpToYou}>`. Typically you'll manage the form's state to know what to post, add an API route to post to, track loading and errors states yourself, revalidate data and propagate changes throughout the UI, and finally deal with errors, interruptions, and race conditions <small>(but let's be honest, nobody _actually_ deals with that stuff)</small>.

**How mutations work in Remix**: Remix uses HTML forms. I know what you're thinking.

> pffft ... I'm building a web app, this will never work.

You might think the API you're about to see looks incapable of handling the needs of a modern web app. Highly interactive web apps have been my entire career, Remix was designed with them in mind. Just because this looks like PHP from ye olden days doesn't mean it can't scale up to modern, sophisticated user experiences. We like to say that Remix scales up, but it scales down, too. So let's go back to ye olden days to help you understand Remix.

Since the dawn of the web, a mutation is modeled as a form and a server page to handle it. Ignoring Remix completely, it looks like this:

```html
<form method="post" action="/add-to-cart">
  <input type="hidden" name="productId" value="123" />
  <button>Add to Cart</button>
</form>
```

```js
// on the server at `/add-to-cart`
export async function action(request) {
  let formData = await request.formData();
  return addToCart(formData);
}
```

The browser navigates to `"/add-to-cart"` with a POST of the form's serialized data, adds pending UI, and renders a new page with all fresh data from your database when it's done.

Remix does the same thing as HTML forms, except optimized with capital-F `<Form>` and a function on your route named `action` (imagine your Next.js pages were their own API route). It posts with `fetch` instead of a document reload and then revalidates all the data on the page with the server to keep the UI in sync with the back end. This is the same thing you're used to doing in an SPA, **except Remix manages it all for you**.

There's no application code needed to communicate a mutation with the server other than the form and the serverside action. There are no application context providers or global state management tricks to propagate the change to the rest of the UI either. This is why the Remix bundles are nearly 30% smaller than the Next.js bundles, you don't need all that code to talk to your "API routes".

Oops, I lied again. That code actually works in Remix. If you use lowercase `<form>` the browser handles the post instead of Remix. Handy for situations where the JavaScript fails to load 😅 <small>(more on that later)</small>

You can scale up to fancy UI by asking Remix about the transition for busy spinners and progress or the data being posted to create optimistic UI. The model is HTML forms, the capability is anything your designers come up with. And you don't have to completely rearchitect your implementation to say "no problem, we can do that."

Smaller bundles and a simple mutation API aren't the only thing Remix does for you here, either.

Because Remix handles all of your interactions with the server (both data loading and data mutations), it has a unique ability in the web framework space to fix long-standing issues with web apps.

## Unhandled Errors

What happens when the "add to cart" backend handler throws an error? Here we block requests to the routes that add items to the cart to see what happens.

<figcaption>Next.js Failed POST</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/next-error.mp4" type="video/mp4" />
</video>

Nothing happens. Error handling is difficult and annoying. Many developers just skip it as they did here. We think this is a terrible default user experience.

Let's see what happens in Remix.

<figcaption>Remix Failed POST</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/remix-error.mp4" type="video/mp4" />
</video>

Remix handles every error around data and rendering in your app, even errors on the server.

All you have to do is define an [error boundary][eb] at the root of your app. You can even get more granular and only take down the section of the page that had an error.

The only reason Remix can do this and Next.js can't is because Remix's data abstractions didn't stop with how to get data into your app, but also how to change it.

## Interruptions

Users often click a button twice on accident and most apps don't deal with it very well. But sometimes you have a button that you fully expect the user to click really fast and want the UI to respond immediately.

In this app, the user can change the quantity of items in the cart. It's likely they'll click it very quickly to increment the number a few times.

Let's see how the Next.js app deals with interruptions

<figcaption>Next.js Interruption</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/change-quantity-next.mp4" type="video/mp4" />
</video>

It's a little difficult to see exactly what's happening, but if you scrub the video controls you can see it better. There's a weird thing from 5 to 6 to 5 in the middle. The final seconds are the most interesting though. You can see that the very last request sent lands (to go to 4) and then a couple frames later the very first request sent lands! The quantity fields jumps from 5, to 4, to 2, without any user interaction. Kind of hard UI to trust.

This code didn't manage race conditions, interruptions, or revalidation, so the UI is now possibly out of sync with the server (it depends if the 2 or the 4 was the last to hit the server side code). Managing interruptions and revalidating data after mutations would have prevented this.

I get it, dealing with race conditions and interruptions is hard! That's why most apps don't do it. The Vercel team is one of the most talented development teams in the industry and even they skipped it.

In fact, when we ported the React Server Components example built by the React Core team in our last blog post, _they also had this same bug_.

I said earlier that we are fanatical about the network tab. Let's see how Remix handles this.

<figcaption>Remix Interruption</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/change-quantity-remix.mp4?f" type="video/mp4" />
</video>

You can see Remix cancels the request on interruptions and revalidates the data after the POST completes. This ensures that the UI across the entire page (not just this form) is in sync with whatever changes your form just made with the server.

You might think that maybe we just had more attention to detail in our app than the Next.js app. None of this behavior is in the application code. It's all built-in to Remix's data mutation APIs. <small>(It's really just doing what the browser does with HTML forms...)</small>

The seamless integration and transition between the client and server in Remix is unprecedented.

## Remix ❤️ the Web

In our decades-long careers in web dev, we remember how simple it used to be. Put a button in a form, point it at a page that writes to the database, redirect, get the updated UI. It was so easy.

When designing Remix APIs, we always look to the platform first. Like the mutation workflow. We knew the HTML form API + a server side handler was right, so we built around that. It wasn't the goal, but a seriously amazing side effect is that the core features of an idiomatic Remix app work without JavaScript!

<figcaption>Remix Without JavaScript</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/no-js.mp4" type="video/mp4" />
</video>

While it's totally valid to use Remix this way, it's not our intent that you build websites without JavaScript. We've got a lot of ambition for building amazing user interfaces and you need JavaScript for that.

Instead of saying "Remix works without JavaScript" we prefer to say "Remix works **before** JavaScript". Maybe your user just went into a tunnel on the train as the page was loading the JavaScript. When they pop back out, the page will still generally work. We were really just going for the simplicity of HTML but we ended up with an incredibly resilient framework.

We look to the web platform for writing your server side code, too. Instead of inventing another new JavaScript request/response API, Remix uses the [Web Fetch API][fetch]. To work with URL search params, we use the built-in `URLSearchParams`. To work with form data, we use the built-in `FormData`.

```js
export function loader({ request }) {
  // request is a standard web fetch request
  let url = new URL(request.url);

  // remix doesn't do non-standard search param parsing,
  // you use the built in URLSearchParams object
  let query = url.searchParams.get("q");
}

export function action({ request }) {
  // formData is part of the web fetch api
  let formData = await request.formData();
}
```

You will find that when you start learning Remix, you'll spend as much time on the [MDN][mdn] docs, if not more, than the Remix docs. We want Remix to help you build better websites even when you're not using it.

Get better at Remix, accidentally get better at the web.

It's a core value for us. While Remix apps are incredibly fast, we actually aren't hyper focused on performance, just great user and developer experiences. We look to the platform for answers to problems, make them easier to use, and the performance generally takes care of itself.

## Optimizing for Change

Now that you know how both frameworks do things, let's see how the apps respond to change. I've always liked the phrase "optimize for change", and we talk about that a lot when we design Remix APIs.

### Changing the Home Page

Let's consider you want to change the products on the home page, what does that look like? You have two choices in Next.js:

- Rebuild and redeploy your app. Your build times will grow linearly with the number of products in your store (each build has to pull data from Shopify for every product). Simply changing a typo in your footer requires you to download every product from Shopify to deploy that change. As your store grows to thousands of products, this will become a problem.

- Use [Incremental Static Regeneration][isr]. Vercel recognizes the issue with build times in SSG, so they created ISR. When a page is requested, the server sends the cached version and then rebuilds it with fresh data in the background. The next visitor get's the newly cached version.

  If the page wasn't built when you deployed, Next.js will server render the page and then cache it on the CDN. This is **exactly** what HTTP stale-while-revalidate does, except ISR comes with a non-standard API and vendor lock-in.

In Remix, you simply update your products with Shopify and your products will be updated within your caching TTL. You could also set up a webhook in an afternoon to invalidate the home page query.

This infrastructure is more work than going with SSG, but as we've seen in this article, it scales to any size product catalog, any kind of UI (the search page) and actually gets faster than SSG with more users (we can cache common search queries). You're also not coupled to a specific host, and barely coupled to a framework since Remix uses mostly standard web APIs for application logic.

Additionally, we think loading data in only one way, on the server, leads to cleaner abstractions.

### What about cache misses?

This is a great question. Server and HTTP caching only work when your site is getting traffic. Turns out, your business only works when your site is getting traffic too 😳. You don't need two page views a day to be one second faster, you need a mailing list.

- Empty cache hits on product pages in Remix are no slower than the search page in the Next.js site (where it can't use SSG). When was the last time you shopped online without searching? As that cache fills up with common queries, it gets even faster.
- Common landing pages will be primed pretty much always, then Remix's prefetching makes the next transitions instant. Remix can prefetch any page, dynamic or otherwise, Next.js doesn't.
- At a certain scale with SSG, you'll need to switch to ISR. Now you have the same cache miss problem on pages that weren't part of your last deployment

If cache miss requests are a significant portion of your visits, getting 100% cache hits won't fix your business: you don't have a technical problem, you have a marketing problem.

### Personalization

Let's look at another change. Imagine the product team comes to you and says the home page is changing to display similar products to what the user has purchased in the past, instead of a set list of products.

Like the search page, SSG is out the door, and your performance by default with it. SSG really has a limited set of use cases.

Virtually every website has users. As your site grows, you're going to start showing the user more and more personalized information. Each time, that becomes a client side fetch. At some point, the majority of your page is client fetched and your performance is gone.

For Remix, this is just a different database query on the back end.

Consider the top of the ecommerce food chain: Amazon.com. That entire page is personalized. We already know the end from the beginning. Invest in architecture that will get you there, not stuff you'll need to drop when the product team tweaks the home page.

## Bottom Line

It's easy to miss the power in Remix's deceptively simple `<Form>` + `action` + `loader` APIs and the design to keep as much on the server as possible. It changes the game. These APIs are the source of Remix's faster page loads, faster transitions, better UX around mutations (interruptions, race conditions, errors), and simpler code for the developer.

Remix apps get their speed from backend infrastructure and prefetching. Next.js gets its speed from SSG. Since SSG has limited use cases, especially as features and data scale, you will lose that speed.

SSG and the Jamstack were great workarounds for slow backend services. The latest generation of platforms and databases is fast and only getting faster. Even the Shopify API backing these apps can send a response to a query in 200ms from pretty much anywhere in the world, I tested it from every continent except Antarctica! <small>(Going to need [@chancethedev](https://twitter.com/chancethedev) to try it out for me when he's there this month.)</small>

It would honestly be totally acceptable to skip all caching strategies this article discussed and hit the Shopify API in each request on the server. Instead of a 1.2s load it would be 1.4. Instead of 0.8s it would be 1. Bupkis. If you've got a slow backend API, **invest your time making your back end fast**. If you don't have any control over it, deploy your own server and cache there where you can speed up any page for all users.

Investing in your back end will yield the same performance results as SSG, but it scales to any kind of page. It will require more initial work than SSG, but we think it's worth it for your users and your code in the long run.

Data loading is only half of the story, too. In Remix, your data abstractions can also encapsulate data mutations. All the code stays on the server, leading to better application code and smaller bundles in the browser.

With Next.js you have to ship your own data mutation code to the browser to interact with the API routes and propagate updates to the rest of the UI. As we saw in this article, even top teams mess this up around errors, interruptions, and race conditions.

> Aren't you ignoring `getServerSideProps`?

Some folks say you can do all the things Remix does with `getServerSideProps`. This question comes from us not having a chance to explain Remix very well yet!

As mentioned before, this would definitely speed up the search page. However, you still have the data mutations to deal with. You'll need a combination of `getServerSideProps`, API routes, and your own browser code that communicates with them for mutations (including error handling, interruptions, race conditions, redirects, and revalidation). What we're really saying here is "you could build your own Remix". Indeed, you could. We already did 😇.

Phew!

Now that we've answered the big question everybody keeps asking us, our future posts will really start showing off what Remix can do!

---

- [Next.js Live Example][next-demo]
- [Next.js Source Code](https://github.com/vercel/commerce/tree/a6babd93d50ebc1b9106edcfb5834a8a2437838e)
- [Remix Live Example][remix-rewrite]
- [Remix Source Code](https://github.com/jacob-ebey/remix-ecommerce)

[wpt-virginia-cable]: https://www.webpagetest.org/video/compare.php?tests=220113_BiDc2H_cfaa25c420a8552959c39df6a7d24e08,220113_BiDc1H_6121ab1c9a5c969874e64344aecce3ec,220113_BiDc9N_b9e84f012470b1aeb51754fb010133d9
[wpt-virginia-cable-gif]: /blog-images/posts/remix-vs-next/wpt-virginia-homepage-cable.gif
[wpt-virginia-cable-gif-slow-mo]: /blog-images/posts/remix-vs-next/wpt-virginia-homepage-cable-slow.gif
[wpt-virginia-search-cable]: https://www.webpagetest.org/video/compare.php?tests=220114_AiDcG6_3792ae086fc7d2decbddddc1cc521705,220114_BiDcWS_3b730524b3294cc4aabd961753821fe2,220114_AiDcD6_7aa4143672ff6295a8b88392f3e5ef42
[wpt-virginia-search-cable-gif]: /blog-images/posts/remix-vs-next/wpt-virginia-search-cable.gif
[wpt-virginia-search-miss]: https://www.webpagetest.org/video/compare.php?tests=220114_AiDcMN_e671a25cc0dc7b5bb0986e397e00f044,220114_AiDc8W_e897cd8815342449977013c2d57a4daf,220114_AiDcQX_d4ce4649434538f369982fa828abae82
[wpt-virginia-search-miss-gif]: /blog-images/posts/remix-vs-next/wpt-virginia-search-miss-cable.gif
[wpt-virginia-search-miss-fast]: https://www.webpagetest.org/video/compare.php?tests=220114_BiDc1T_9ea8b52894cbd02675159ae963750ace-r:1-c:0
[wpt-hkg-search-3g]: https://www.webpagetest.org/video/compare.php?tests=220114_BiDcDX_a0db98ec1d32d3be3e263fab2628df47,220114_AiDcJF_f139b368029039e7de112963e2fb43b8
[shopify-api-is-fast]: https://www.webpagetest.org/result/220114_AiDcQX_d4ce4649434538f369982fa828abae82/1/details/#waterfall_view_step1
[wpt-hkg-search-3g-gif]: /blog-images/posts/remix-vs-next/wpt-hkg-search-3G.gif
[wpt-hkg-search-miss-cable]: https://www.webpagetest.org/video/compare.php?tests=220114_AiDc2R_5dfaa245cd27404654074fba9cd73248,220114_AiDcM4_9b913562cae343803f0c4efef48b51b8,220114_AiDcYP_534551c67b82cd664aae1c0813c384de
[wpt-hkg-search-miss-cable-gif]: /blog-images/posts/remix-vs-next/wpt-hkg-search-miss-cable.gif
[hkgsearchcomp]: https://www.webpagetest.org/video/compare.php?tests=220110_AiDcMC_9b1603305e652189ea080a7b8ae75973,220110_AiDc72_5d6c4bc51f42348f04eee578560bf1cd
[hkgsearchcompgif]: /blog-images/posts/remix-vs-next/hkg-search-comp.gif
[nextnojs]: /blog-images/posts/remix-vs-next/next-no-js.jpg
[next-demo]: https://Shopify.demo.vercel.store/
[remix-port]: https://remix-commerce-mcansh.vercel.app/
[remix-rewrite]: https://remix-ecommerce.fly.dev
[remix-port-comp]: https://www.webpagetest.org/video/compare.php?tests=220107_BiDcXG_957c13e3a7f5032087c05863a51897bd,220107_BiDcR8_009afbe99ea1cf88d225d7d477be5e89
[remix-rewrite-comp]: https://www.webpagetest.org/video/compare.php?tests=220107_AiDcK1_cea51d961abd2fb47b99323b57639e65,220107_BiDcEZ_bccde0e5f3f4e88d01ec5e6a9e5e8af0
[next-examples]: https://nextjs.org/examples
[wpt]: https://webpagetest.org
[getstaticprops]: https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation
[swr]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-while-revalidate
[isr]: https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration
[next-img]: https://nextjs.org/docs/basic-features/image-optimization
[remix-empty-cache]: https://webpagetest.org/result/220108_AiDcA0_c4f31854ad52fa5ac54c7f725871de01/1/details/#waterfall_view_step1
[sie]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-if-error
[prefetch]: https://caniuse.com/link-rel-prefetch
[sydney-cache-miss-comp]: https://www.webpagetest.org/video/compare.php?tests=220110_BiDcTH_bfa0341e83efd414f71ac8ed2f1d311f,220110_AiDcC5_7efb60a6c8e1eb4928922b5bac788436#
[sydney-cache-miss-gif]: /blog-images/posts/remix-vs-next/sydney-cache-miss-cable.gif
[vercel-miss]: https://www.webpagetest.org/result/220110_BiDcT5_204e5de35a6e50af0e62b4972b34c987/1/details/#waterfall_view_step1
[redis]: https://redis.com/
[code-next-add-to-cart]: https://github.com/vercel/commerce/blob/3670ff58690be3af9e2fc33f0d4ba04c992d2cb9/components/product/ProductSidebar/ProductSidebar.tsx#L64
[code-next-api-call]: https://github.com/vercel/commerce/blob/3670ff58690be3af9e2fc33f0d4ba04c992d2cb9/components/product/ProductSidebar/ProductSidebar.tsx#L29-L41
[eb]: https://remix.run/docs/en/v1/guides/errors
[next-shopify]: https://github.com/vercel/commerce/tree/f3cdbe682b6153b6881d8a6597b44429424de269/framework/shopify
[remix-shopify]: https://github.com/jacob-ebey/remix-ecommerce/blob/0abc6a5ad8117961d49dce22764ad06a4508733c/app/models/ecommerce-providers/shopify.server.ts
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[delayed-images]: https://www.webpagetest.org/result/220113_BiDc1H_6121ab1c9a5c969874e64344aecce3ec/1/details/#waterfall_view
[resource-route]: https://remix.run/docs/en/v1/guides/resource-routes
[volume]: https://fly.io/docs/reference/volumes/
[fly]: https://fly.io/docs/reference/regions/
[cloudflare-network]: https://www.cloudflare.com/network/
[cf-workers]: https://workers.cloudflare.com/
[mdn]: https://developer.mozilla.org/en-US/docs/Web
