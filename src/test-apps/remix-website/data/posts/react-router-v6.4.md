---
title: "React Router 6.4 Release"
summary: "React Router 6.4 was released today, adding all of data loading, data mutation, pending navigation, and error handling APIs from Remix to every React Router app."
date: 2022-09-13
image: /blog-images/posts/remixing-react-router/image.jpg
imageAlt: Glowing React Router logo, 6 dots in an upward pyramid with a path of three from top to bottom connected.
authors:
  - Ryan Florence
---

After several months of development, the data APIs from Remix have arrived for React Router in v6.4.

## Feature Overview

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/aX74DbFT5nI?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

The web is a wonderful place where [highly dynamic shopping experiences][tesla], [creative productivity software][figma], and [super basic but excellent classified ads][craigslist] are all possible on the same platform.

While these websites are all wildly different, they all have one thing in common: <b>data coupled to URLs</b>. It's not just about data loading either. They all have data mutations, too! React Router 6.4 embraces this reality with new conventions, APIs, and automatic behaviors for:

- Loading data into components
- Updating data in components
- Automatic data revalidation after updates
- Managing race conditions and interruptions for navigations, mutations, and revalidation
- Managing errors and rendering something useful to the user
- Pending UI
- Skeleton UI with `<React.Suspense>`
- and more...

## Why Couple Routing and Data?

Most people realize that `<Link>` renders `<a href>` underneath, preventing the default browser behavior (sending a document request to the server) and instead changes the URL with JavaScript. It's kinda like this:

```jsx
function Link({ to }) {
  return (
    <a
      href={to}
      onClick={(event) => {
        event.preventDefault();
        doReactRouterStuff();
      }}
    />
  );
}
```

You've definitely written that kind of code yourself, except with a `<form>`

```jsx
function NewContactForm({ to }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        doYourThing();
      }}
    />
  );
}
```

Have you ever wondered...

> What default event am I preventing here?

Just like `<a href>`, `<form action>` also creates a request and sends it to the server when the user submits it. The only difference is a form can send along some data and usually means you want to update your database.

In other words, **data mutations with HTML forms are routing events.**

It's hard to explain just how much simpler and more capable your code becomes when your router understands the full data lifecycle with data loading (`<a href>`) and mutations (`<form action>`). You kind of have to experience it yourself, so take it for a spin today:

- [Feature Overview][featureoverview]
- [Tutorial][tutorial]

Happy routing!

[craigslist]: https://craigslist.com
[tesla]: https://www.tesla.com/model3/design
[figma]: https://figma.com
[remix]: /
[featureoverview]: https://reactrouter.com/en/main/start/overview
[tutorial]: https://reactrouter.com/en/main/start/tutorial
