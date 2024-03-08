---
title: Not Another Framework!
summary: The web ecosystem can feel like it moves too fast sometimes. We're sensitive to that at Remix so we've designed it with your future in mind. Get good at Remix, get better at the web.
date: 2022-01-26
image: /blog-images/headers/not-another-framework.jpg
imageAlt: Frustrated developer looking at her laptop with her hands on her head.
authors:
  - Ryan Florence
---

I'm certain there are a lot of you out there who are seeing the excitement around Remix and thinking:

> Ugh, I'm not ready for something new ... stuff changes too fast!

I get it! Learning how to solve the same problems but with a different API is exhausting. The worst part is feeling like all the deep knowledge I have with my current tools is now obsolete, and I'm a beginner all over again. That _is_ exhausting.

> Isn't Remix new? Won't it be exhausting?

I hope not! When you work in Remix, you're mostly working with standard web APIs. You're either already familiar with them, or you'll learn them for the first time. This knowledge will not just help you build great user experiences in Remix, but it will help you outside of Remix today and in the future. That's why I think Remix is worth your time in this wild, ever changing web development world.

## Non-Transferable Knowledge

I used to lead the Frontend Infrastructure team at a previous job. While talking to a co-worker who was leaving for a new job, they said something to me that has kind of haunted my thoughts ever since:

> They don't use [the framework we're using], so everything I learned the last two years here doesn't even matter!

That hit me hard. I hated it. Even though it was a JavaScript framework, the one we used had its own way of doing almost everything, even adding items to arrays was different. My co-worker felt like the time with us was mostly wasted!

Of course, all programming experience is still experience. But when it comes to frameworks, there is often a lot of knowledge that doesn't transfer to the next thing. Throughout my career, I've worked with a few that had huge amounts of API I had to memorize, many of which the web platform already had a solution for. That knowledge is mostly useless now.

When we design Remix APIs, this is something we think about. We want your experience with Remix to transfer to web development generally.

## Transferable Knowledge

This is kind of personal to me because of how I learned JavaScript.

While I started web development before JavaScript was even created, I didn't really get into JavaScript until the great framework wars between Prototype.js, MooTools, and jQuery.

One day I added a jQuery plugin to my page and everything blew up on me. I already had a MooTools plugin and the two were incompatible! After some googling, I learned what a "JavaScript Framework" was, that there was a war being waged, and that I had to pick a side 😲.

I was far too inexperienced to even know how to make this decision, but thought of a funny way to make it with some amount of objectivity: I'd run their homepages through an XHTML validator 😂. XHTML was all the rage back then. I figured if a framework was thoughtful in their HTML they were probably thoughtful in their JavaScript too.

jQuery had a ton of errors, Prototype had a few, and MooTools had zero! I found my framework.

I'm really glad I picked MooTools because for the next few months, **as I learned MooTools, I accidentally learned JavaScript**.

MooTools' API design was so careful, I'm still in awe. Nearly every feature in MooTools is implemented with some lower level API of MooTools, until you get to the core APIs that were implemented the way JavaScript itself implements features: prototypes! You can see it just by scanning the [first lines of code in MooTools](https://github.com/mootools/mootools-core/blob/1.3x/Source/Core/Core.js).

One day it clicked. Instead of MooTools, I saw The Matrix and realized

> ... I know ~~Kung Fu~~ JavaScript!

It tricked me into learning JavaScript deeply: from prototypes to context binding, and object identity to the DOM. Throughout my career, the fundamental knowledge that MooTools gave me helped me pick up every JavaScript thing that came after it.

MooTools provided pragmatic, high-level abstractions to get the job done, but it did it in a way that backfilled my knowledge of the fundamentals along the way—instead of sprawling APIs you have to memorize. <small>(Extending built-in prototypes turned out to be a bad idea in the end, but that story will have to wait.)</small>

React was similar for me. Instead of special objects and syntax to "bind a view", it brought a fresh new approach where you just wrote JavaScript and then said "set state!". So while you do need to learn a few React specific APIs, most of your code is just JavaScript. That's transferrable knowledge!

## Learn Remix, Accidentally Learn the Web

It is an explicit goal of ours to design APIs that are high-level enough to help you just get the job done, but close enough to the web to backfill your fundamental knowledge of ~~Kung Fu~~ the web.

We want your experience with Remix to help you build better websites in any framework. Heck, we want to provide the foundation you need to be the person who builds the framework we all use after Remix! <small>(Give us a few years of glory first though, please, we've got families and children to feed.)</small>

In practical terms, what does this mean?

Consider how many request/response APIs you've learned in JavaScript. Node.js has one, express has one, aws, azure, Next.js, Netlify, hapi, restify, etc. all have their own request/response APIs. Many are similar, some wrap others, but none are web standards.

When browsers shipped `fetch` they shipped a [standard API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for network requests and responses too. Instead of coming up with our own thing, we went with this web standard for our server abstractions. For example:

```jsx
export function loader({ request }) {
  // request is a web fetch Request!
}
```

When you learn how to handle requests and send responses in Remix, you're actually learning the Web Fetch API that's in the browser already. The fetch API is also being adopted in emerging edge platforms like CloudFlare workers and Deno. This knowledge transfers!

This philosophy drives several other APIs in Remix, too:

- Data mutations are modeled as HTML forms. You write a plain form and then Remix manages the server communication, providing all the state to your app to build the fanciest of modern web app user interfaces. Did you know that `<button>` can have a value just like `<input>`? This focus on HTML makes building data driven web apps a snap. HTML knowledge transfers.
- Form values you work with on the server are standard `FormData` objects.
- Form values during a mutation in the client for pending and optimistic UI are likewise `FormData` objects.
- Remix relies on HTTP caching of static pages instead of wrapping it with a special SSG API: same result, but one is standard web technology that transfers.
- Docs and examples use `new URL(request.url).searchParams` instead of a special middleware to parse the URL in non-standard ways.
- Cookies and sessions are built on top of the Web Fetch API `Request` and `Response` objects

The Remix API is mostly a pile of lifecycle hooks that eventually hand you something from the web platform. After a while, you'll find that you spend more time on MDN than the Remix docs. Don't take our word for it, [search "@remix_run mdn" on twitter](https://twitter.com/search?q=%40remix_run%20mdn&src=typed_query&f=live)!

## Give Remix a Shot

Web development changes fast. Collecting and purging all of that non-transferable knowledge **is** exhausting. We're confident that your time with Remix will provide transferable knowledge that will influence the rest of your web development career. Give it shot, and let us know how it goes 😁

[The quick start tutorial](/tutorials/blog) is a great place to start!
