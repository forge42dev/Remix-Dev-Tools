---
title: React Server Components and Remix
summary: The current state of React Server Components their future in Remix.
date: 2021-12-07
image: /blog-images/headers/react-server-components.jpg
imageAlt: "Screenshot of two apps, one with loading spinners"
authors:
  - Ryan Florence
---

One big question keeps coming up after the Remix v1 release:

> What about React Server Components?

Great question! Like many of you, we've been experimenting with React Suspense since it was first announced in 2018. In fact, the early versions of Remix used it. Realizing it probably wouldn't be released by the time we were ready, we built the async parts of Remix into the framework and are very happy with the results.

Now that React Server Components (RSC) seem to be getting more attention, we've taken another look and done some testing to try and figure out the best way to take advantage of them in Remix. We are well aware that RSC is still in the experimental stage so we do not intend this research to be the last thing we ever say about RSC and Remix. We just thought it'd be useful to share our perspective for the sake of everyone who is using Remix (and React Router) and curious about using RSC as well.

But first, a little background: [What are React Server Components?][server-components]

## Obsessed with UX

At Remix, we are absolutely obsessed with the user experience (UX). One major thing we keep a close eye on is the network tab in the browser. If the network tab is a mess, the UX is probably a mess: bouncing spinners, slow load times, etc. If the network tab is clean, your UX is likely snappy and responsive. How your app loads data affects the shape of your network tab.

In today's React ecosystem, there are three ways to load data into your app:

1. **Render-Fetch Waterfalls** (aka "fetch as you render"): This refers to fetching data inside of components, from the browser, after a JavaScript bundle has been loaded and rendered. We call it a "waterfall" because after a bundle loads, renders, and kicks off a data fetch, it renders child components that do the same. Load modules → render (spinner) → fetch → render children (more spinners) → fetch in children → etc. Each time you render and show a spinner is another step in the waterfall.

   If you haven't already, [take a scroll down our home page](https://remix.run) to see how this method of loading data affects the UI. It creates artificial data and module hierarchies by coupling those resources to UI hierarchy. You don't know what to fetch until you render, and you can't render until you fetch the parent's data! This tends to create "jank" in the UI and cause [cumulative layout shift](https://web.dev/cls/) (CLS) as child views pop into the page after parent views have already rendered.

2. **Fetch, Then Render**: Before rendering a page, fetch all of your data and then render the entire page at once. This is the default behavior in Remix. This is also how most websites have worked for decades. Because of nested routes, Remix knows all of the dependencies for a page (JS modules, data, even CSS) just from the URL so it can run all queries and load resources in parallel. It can even prefetch those resources when you think the user is going to visit a page. As you'll see in this post, this has a positive impact on the initial page load and subsequent navigation.

3. **Render As You Fetch**: Like _fetch, then render_, you kick off all loading in parallel but you don't wait for all of the resources. Instead, you render whichever pieces are ready when they're ready. This is not possible unless you're already able to _fetch, then render_. It's an optimization to get something useful (not an empty div please!) to the user ASAP.

**Almost every app in the React ecosystem today uses render-fetch waterfalls**. This is the default behavior for any data fetching that runs inside a `useEffect()` hook, including libraries like `react-query`, `useSWR`, Apollo Client, and many others.

Out of the box, React Server Components are _also_ a **render-fetch waterfall**. Because fetching is done inside of components, your app doesn't know what to fetch until a component renders.

The problem is that out of the three, the render-fetch waterfall provides the worst UX. Let's run some tests to see why.

## The React Team's Demo

I took [the React Server Components demo][demo] from the core React team at Facebook, shuffled code around into Remix's route conventions, and then deployed both versions to servers in Australia so we could really feel it here in the US (I want Laksa King so bad right now. If you know, you know).

The Remix version isn't using React Server Components, it's just plain ol' Remix on React 17. My goal here was to see what kinds of performance I'd get out of the box on each and see where Remix could benefit from RSC.

<iframe width="100%" height="390" src="https://www.youtube.com/embed/fqqAlBOmj-E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

While RSC is still just an experiment, and this is just a toy app, I was honestly surprised that **Remix is over twice as fast as RSC on the initial page load**. (I should have eaten 2x the Laksa King last time I was in Sydney.)

If you look at the network tab, you can see how Remix loads resources in parallel while RSC results in a cascading waterfall of requests. Fetch code, render, fetch server component, render. This UI doesn't have any nesting either, which is why I was so surprised to see Remix outperform RSC by so much. Loading nested UI is where Remix really shines over the alternatives.

However, I also recognize that the demo from the React team doesn't really take advantage of React Server Components' killer feature, which is the ability to stream the response during the initial server render. Without streaming rendering, RSC is really just another way to fetch inside of components.

## SSR Streaming, Next.js Demo

I decided to measure against a React Server Components demo that also incorporates streaming server rendering. I've been excited about this feature for (I think) years. I grabbed the [Next.js Hacker News clone][next-hn] and shuffled the code into Remix's data loading conventions to see what the two felt like side-by-side. Then I deployed both apps to Vercel so that they're running on the same servers.

This time I fully expected Remix to lose.

<iframe width="100%" height="390" src="https://www.youtube.com/embed/ok3ItRdi7w8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Again, Remix was more than twice as fast as RSC and Next.js, even without the HTTP caching (the real HN has user data in it so that wouldn't fly). Additionally, the Remix version didn't show any spinners and didn't have any content layout shift.

Also, there's no nested UI here either, but Remix still loads faster than Next.js + RSC + SSR streaming by 2x (5x with stale-while-revalidate caching).

## Remix Can Take Full Advantage of RSC

The strategy RSC were built for is **Render As You Fetch**. RSC alone is insufficient to _render as you fetch_. It needs a framework above it to kick off a parallel load of resources before rendering. Neither of these demos has any nesting where this becomes critical.

Facebook has Relay, a fancy compiler, backend infrastructure, and multiple teams of engineers that get paid way more than you and I to know what to fetch before rendering.

But you have Remix 🤗

In today's landscape, Remix is uniquely positioned to take full advantage of Suspense, RSC, and SSR Streaming: it already knows everything about a page just from the URL, just what React needs for render as you fetch.

Additionally, Remix already has the benefits of co-locating your server and client code, including the `{name}.client.js` and `{name}.server.js` file convention (it's usually not needed, but it hints to the compiler which files should run only in one place or the other).

For the developer experience, Remix route modules are already "server components". Using RSC is just an implementation detail of Remix itself.

When RSC is ready for adoption in Remix, migrating will probably be as easy as renaming one of your route files:

```sh
git mv routes/posts.tsx routes/posts.server.tsx
```

However, we are going to wait until RSC is stable and doesn't have the performance and UX issues we've seen here before integrating it into Remix.

The real test will be Remix + RSC vs Remix Alone. If Remix + RSC provides a better user experience, we're all over that. But it's hard to justify putting in that effort when we're already beating the current demos by 2x or more.

Again, those are demos of fake apps, so we're not taking them too seriously. However, we do have a pretty major concern with the tradeoff RSC makes on the network tab.

## Zero-Bundle, or Infinite Bundle?

It seems todays web development zeitgeist is an obsession with initial page loads and Time To First Byte (TTFB). But here's an equally important question: **what happens _after you've got the user on the page?_**

Obsessing only over TTFB is like trying to get ripped by working out but ignoring your diet (ah crap, that's what I do! ... Laksa King sounds so good right now though).

Close your M1X MacBook Pro, grab my kid's chromebook from school, unplug the CAT-6 cable and hop on my in-laws WiFi. You'll see a whole different personality come out your website.

The user experience of spending an hour reading status updates, updating records, creating posts, and sending messages on a low power device with a spotty network is just as important as the initial page load on any device on any network at Remix. So what does it have to do with RSC?

I did a "speed run" through the React Team's demo to see how long it took to get the app to display each page. It's a silly metric, but when I use a slow website, that sluggish feeling compounds over time and gives me a general feeling that "this website isn't that great". I think this captures that feeling.

<iframe width="100%" height="390" src="https://www.youtube.com/embed/C7bcjt8z3o4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

As you can see in this demo, the RSC version loads 34x more JavaScript over the wire than the Remix version (!).

> No it was 16x with a primed browser cache

Oh Right. 16x More JavaScript?! What the heck is going on here?

In addition to streaming rendering, another one of React Server Components' big features is "Zero-Bundle". The idea is to send less on the initial page load to speed it up (we saw earlier that in this demo it didn't). The idea is:

1. The browser never needs to load the JavaScript bundle that contains the template that renders the server component
2. It also removes the need for the typical React SSR inline hydration `<script>` full of JSON that's repeated in the markup already (open the devtools on this site and you'll notice this post is repeated in the markup and an inline script tag at the bottom ... also, all those errors are youtube, not us 😰)

This sounds great on the surface, but now every time the user interacts with the site **the template is repeated in the server component payload**. In other words, every time you fetch from the server you get the fully rendered markup, not just the data.

Clicking on a single item in the Server Components demo results in a fetch for this (behold: a "server component").

```text
M1:{"id":22,"chunks":[2],"name":""}
M2:{"id":20,"chunks":[0],"name":""}
S3:"react.suspense"
J0:["$","div",null,{"className":"main","children":[["$","section",null,{"className":"col sidebar","children":[["$","section",null,{"className":"sidebar-header","children":[["$","img",null,{"className":"logo","src":"logo.svg","width":"22px","height":"20px","alt":"","role":"presentation"}],["$","strong",null,{"children":"React Notes"}]]}],["$","section",null,{"className":"sidebar-menu","role":"menubar","children":[["$","@1",null,{}],["$","@2",null,{"noteId":null,"children":"New"}]]}],["$","nav",null,{"children":["$","$3",null,{"fallback":["$","div",null,{"children":["$","ul",null,{"className":"notes-list skeleton-container","children":[["$","li",null,{"className":"v-stack","children":["$","div",null,{"className":"sidebar-note-list-item skeleton","style":{"height":"5em"}}]}],["$","li",null,{"className":"v-stack","children":["$","div",null,{"className":"sidebar-note-list-item skeleton","style":{"height":"5em"}}]}],["$","li",null,{"className":"v-stack","children":["$","div",null,{"className":"sidebar-note-list-item skeleton","style":{"height":"5em"}}]}]]}]}],"children":"@4"}]}]]}],["$","section","3",{"className":"col note-viewer","children":["$","$3",null,{"fallback":["$","div",null,{"className":"note skeleton-container","role":"progressbar","aria-busy":"true","children":[["$","div",null,{"className":"note-header","children":[["$","div",null,{"className":"note-title skeleton","style":{"height":"3rem","width":"65%","marginInline":"12px 1em"}}],["$","div",null,{"className":"skeleton skeleton--button","style":{"width":"8em","height":"2.5em"}}]]}],["$","div",null,{"className":"note-preview","children":[["$","div",null,{"className":"skeleton v-stack","style":{"height":"1.5em"}}],["$","div",null,{"className":"skeleton v-stack","style":{"height":"1.5em"}}],["$","div",null,{"className":"skeleton v-stack","style":{"height":"1.5em"}}],["$","div",null,{"className":"skeleton v-stack","style":{"height":"1.5em"}}],["$","div",null,{"className":"skeleton v-stack","style":{"height":"1.5em"}}]]}]]}],"children":"@5"}]}]]}]
M6:{"id":21,"chunks":[3],"name":""}
J4:["$","ul",null,{"className":"notes-list","children":[["$","li","1",{"children":["$","@6",null,{"id":1,"title":"Meeting Notes","expandedChildren":["$","p",null,{"className":"sidebar-note-excerpt","children":"This is an example note. It contains Markdown!"}],"children":["$","header",null,{"className":"sidebar-note-header","children":[["$","strong",null,{"children":"Meeting Notes"}],["$","small",null,{"children":"12/30/20"}]]}]}]}],["$","li","2",{"children":["$","@6",null,{"id":2,"title":"A note with a very long title because sometimes you need more words","expandedChildren":["$","p",null,{"className":"sidebar-note-excerpt","children":"You can write all kinds of amazing notes in this app! These note live on the server in the notes..."}],"children":["$","header",null,{"className":"sidebar-note-header","children":[["$","strong",null,{"children":"A note with a very long title because sometimes you need more words"}],["$","small",null,{"children":"12/30/20"}]]}]}]}],["$","li","3",{"children":["$","@6",null,{"id":3,"title":"I wrote this note toda","expandedChildren":["$","p",null,{"className":"sidebar-note-excerpt","children":"It was an excellent note."}],"children":["$","header",null,{"className":"sidebar-note-header","children":[["$","strong",null,{"children":"I wrote this note toda"}],["$","small",null,{"children":"5:59 PM"}]]}]}]}]]}]
J5:["$","div",null,{"className":"note","children":[["$","div",null,{"className":"note-header","children":[["$","h1",null,{"className":"note-title","children":"I wrote this note toda"}],["$","div",null,{"className":"note-menu","role":"menubar","children":[["$","small",null,{"className":"note-updated-at","role":"status","children":["Last updated on ","3 Dec 2021 at 5:59 PM"]}],["$","@2",null,{"noteId":3,"children":"Edit"}]]}]]}],["$","div",null,{"className":"note-preview","children":["$","div",null,{"className":"text-with-markdown","dangerouslySetInnerHTML":{"__html":"<p>It was an excellent note.</p>\n"}}]}]]}]
```

That's over 4 kB. If you click all three items, you get a response just like it for each one.

Let's contrast with Remix. The first time you click a link, you have to download the code-split JavaScript template for the item view:

```text
import{a as i,c as a,d as p}from"/build/_shared/chunk-CDZR6LSD.js";import{a as m}from"/build/_shared/chunk-DQ7ZO7ZN.js";import"/build/_shared/chunk-XXRJHXMM.js";import{i as d}from"/build/_shared/chunk-2FSL4QX2.js";import{b as l,e as t,f as e}from"/build/_shared/chunk-AKSB5QXU.js";e();e();e();var f=l(p());function r(){let{id:n,title:s,body:u,updatedAt:o}=d();return o=new Date(o),t.createElement("div",{className:"note"},t.createElement("div",{className:"note-header"},t.createElement("h1",{className:"note-title"},s),t.createElement("div",{className:"note-menu",role:"menubar"},t.createElement("small",{className:"note-updated-at",role:"status"},"Last updated on ",i(o,"d MMM yyyy 'at' h:mm bb")),t.createElement(a,{noteId:n},"Edit"))),t.createElement(m,{body:u}))}export{r as default};

import{a as d}from"/build/_shared/chunk-XXRJHXMM.js";import{b as i,e as t,f as e}from"/build/_shared/chunk-AKSB5QXU.js";e();e();var n=i(d());function o({text:r}){return t.createElement("div",{className:"text-with-markdown",dangerouslySetInnerHTML:{__html:(0,n.default)(r)}})}function a({body:r}){return t.createElement("div",{className:"note-preview"},t.createElement(o,{text:r}))}export{a};
```

But from now on, each item click only transfers this little bugger:

```text
{"id": 1, "createdAt": "2020-12-30T10:13:29.023Z", "updatedAt":
"2020-12-30T10:13:29.023Z", "title": "Meeting Notes", "body": "This is an
example note. It contains **Markdown**!"}
```

Because server components couple your data to your template, **your users have to download the template with every single interaction** related to that component. While it's "Zero-Bundle" for your JavaScript, it's "Infinite Bundle" for subsequent navigation 😟.

Of course, this is a little toy demo app, and things always pan out differently in the real world, but logically, these templates will _always be larger than the data_. In my experience, for every ounce of data there's a pound of markup (omigosh I want a pound of Laksa right now).

## Our Take

I messed around with these two demos for several days: loading them from my phone while on the freeway (not driving, ofc, but wishing I could drive to Laksa King), waiting for my kids to get out of school on that hill where the cell connections are spotty, and even inside a church building where almost no cellular waves get through.

In every single case, without exception, Remix is faster than React Server Components. By a lot.

It's unclear to me which network, device, and server conditions RSC was built for. Sending the whole document from Remix always beat the first chunk from RSC: whether the network was fast or slow.

This isn't to say that RSC is "bad". It's still experimental! I'm just saying they aren't compelling for Remix right now. When RSC is stable we will apply the same rigorous testing we have demonstrated here and recommend them for Remix users if they provide a better UX.

My hunch is that RSC has a chance of providing a better UX when your user's network is fast, but your server's data loading is slow. That will be my next bit of research (these demos all had fast server data loading). I expect the first chunk to be useful to the user sooner than your slow server can get a full document to the user through Remix.

But if your slow server is the problem, you can fix that. You can make your server fast, you can't do anything about your user's network. And that's the pitch of Remix, take advantage of modern infrastructure and send less stuff over the network.

Back end infrastructure is getting _really_ good. **Remix can run your entire app at the edge** (close to your users) on platforms like Cloudflare Workers (see [our demo][workers-demo]) and (soon) [Deno Deploy][deno]. Not only can you can run your app servers at the edge, but you can get your data to the edge too with things like [Fly.io Postgres Read Replicas][fly], [Cloudflare KV][cf-kv] and [Durable Objects][cf-durable-objects], [FaunaDB][fauna], and others. These technologies enable you to render full pages—even with user data!—in mere milliseconds.

If you can render a full document, with user data, in 500ms, or even 50ms with Remix, you might ask yourself why you'd want to stream that in with spinners bouncing around (even if it was twice as fast instead of twice as slow today).

We're anxious to hear what the React team has to say about React Server Components and streaming rendering at React Conf this week. For now, we are just happy to be able to provide the core team with our feedback and we hope our research helps push the technology forward. Stay tuned for more news from us in this area!

## Live Demos and Source Code

Hacker News Demos:

- [Next.js HN Live Demo](https://next-news-rsc.vercel.sh/rsc)
- [Remix HN Live Demo](https://remix-hn-one.vercel.app/)

Hacker News Source Code:

- [Next.js HN Source Code](https://github.com/vercel/next-rsc-demo/tree/8bb054d022dbfc5b513d81b1df3775e5be31d460)
- [Remix HN Source Code](https://github.com/ryanflorence/remix-hn)

Notes App Demos:

- [RSC Notes Live Demo](https://react-server-components.fly.dev/)
- [Remix Notes Live Demo](https://remix-sc-notes.fly.dev/)

Notes App Source Code:

- [RSC Notes Prisma Fork](https://github.com/prisma/server-components-demo/tree/598ace3b3d61b90ae8d0d96497f5497942f3b849)
- [Remix Notes Source Code](https://github.com/ryanflorence/server-components-demo/tree/ed52ed6bf70d278540c39305b80634267e6b0dbb)

[cf-durable-objects]: https://blog.cloudflare.com/introducing-workers-durable-objects/
[cf-kv]: https://developers.cloudflare.com/workers/learning/how-kv-works
[db-server]: https://github.com/prisma/server-components-demo/blob/c1dc0cd124b178fa41fa0a1cdc3792ff729918b4/src/db.server.js
[demo]: https://github.com/reactjs/server-components-demo/tree/9285cbd2624c6838ebd2d05df1685df2c0f2f875
[deno]: https://deno.com/blog/deploy-beta1
[ember-firebase]: https://github.com/mjackson/ember-firebase
[fauna]: https://fauna.com/
[fly]: https://fly.io/docs/getting-started/multi-region-databases/
[normal-prisma]: https://github.com/prisma/prisma/blob/1904c4b11fd5a5faa7c9ab9098667fb27e2b3c07/packages/react-prisma/src/index.ts#L94-L95
[prisma-demo]: https://github.com/prisma/server-components-demo/blob/36de5831ac2df454a223a7094c46acc53edf1ee2/src/NoteList.server.js
[react-fs]: https://unpkg.com/browse/react-fs@0.0.0-experimental-3310209d0/cjs/react-fs.node.development.server.js
[react-packages]: https://github.com/prisma/server-components-demo/blob/c1dc0cd124b178fa41fa0a1cdc3792ff729918b4/package.json#L27-L29
[react-prisma]: https://github.com/prisma/prisma/blob/1904c4b11fd5a5faa7c9ab9098667fb27e2b3c07/packages/react-prisma/src/index.ts
[server-components]: https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html
[workers-demo]: https://remix-cloudflare-demo.jacob-ebey.workers.dev/
[next-hn]: https://github.com/vercel/next-rsc-demo/tree/8bb054d022dbfc5b513d81b1df3775e5be31d460
