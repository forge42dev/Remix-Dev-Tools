---
title: React Router v6
summary: After years of work and millions of monthly downloads, React Router v6 is finally here.
date: 2021-11-03
image: /react-router-v6.jpg
imageAlt: "A fork in the road in the middle of the woods"
authors:
  - Michael Jackson
---

Today we are very happy to announce the stable release of [React Router v6](https://reactrouter.com).

This release has been a long time coming. The last time we released a major breaking API change was over four years ago in March 2017 when we released version 4. Some of you probably weren't even born then. Needless to say, a LOT has happened since that time:

- Downloads of React Router grew by over 60x (6000%) from 340k/month in March 2017 to 21M/month in October 2021
- We released version 5 with no breaking changes (I've already written about the reason for the major version bump [elsewhere](https://reacttraining.com/blog/react-router-v5/))
- We released Reach Router which currently gets about 13M downloads each month
- React Hooks were introduced
- COVID-19

I could easily write at least a few pages about each of the bullet points above and its significance to both our business and the open source project we've been managing since 2014. But I don't want to bore you with the past. We've all been through a lot over the last few years. Some of it has been rough, but hopefully you've experienced some new growth as well. We sure have. In fact, we completely changed our business model!

Today I want to focus on the future and how we are drawing on our experiences from the past to build the strongest possible future for the React Router project and the incredible React community. There will be code. But we are also going to talk about business and what you can expect from us (hint: it's [very colorful](https://remix.run)).

## Why Another Major Version?

Easily the single biggest reason for a new router release is the advent of React hooks. You may remember [Ryan's talk](https://www.youtube.com/watch?v=wXLf18DsV-I) introducing hooks to the world at React Conf 2018 and how a lot of the code that we were all used to writing with React's "lifecycle methods" just sort of melts away as you refactor class-based React code to hooks. If you don't remember that talk, you should probably just stop here and go watch it. I'll wait.

Although we bolted a few hooks onto v5 in 5.1, React Router v6 was built from scratch using React hooks. They are such an efficient low-level primitive that we were able to eliminate a lot of the boilerplate code by providing hooks that do the job instead. This means your v6 code will be much more compact and elegant than your v5 code.

Also, it's not just _your_ code that's getting smaller and more efficient... it's ours too! **Our [minified gzipped bundle size](https://bundlephobia.com/package/react-router-dom@5.3.0) dropped by more than 50% in v6!** React Router now adds less than 4kb to your total app bundle, and your actual results will be even smaller once you run it through your bundler with tree-shaking turned on.

## A Composable Router

To demonstrate how your code is improved with hooks in v6, let's start with something really simple like accessing the params from the current URL pathname. React Router v6 provides [a `useParams()` hook](https://reactrouter.com/docs/en/v6/api#useparams) (also in 5.1) that allows you to access the current URL params wherever you need them.

```tsx
import { Routes, Route, useParams } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="blog/:id" element={<BlogPost />} />
    </Routes>
  );
}

function BlogPost() {
  // You can access the params here...
  let { id } = useParams();
  return (
    <>
      <PostHeader />
      {/* ... */}
    </>
  );
}

function PostHeader() {
  // or here. Just call the hook wherever you need it.
  let { id } = useParams();
}
```

Now contrast this simple example with how you might have done the same thing in v5 or prior with a render prop or a higher-order component.

```tsx
// React Router v5 code
import * as React from "react";
import { Switch, Route } from "react-router-dom";

class App extends React.Component {
  render() {
    return (
      <Switch>
        <Route
          path="blog/:id"
          render={({ match }) => (
            // Manually forward the prop to the <BlogPost>...
            <BlogPost id={match.params.id} />
          )}
        />
      </Switch>
    );
  }
}

class BlogPost extends React.Component {
  render() {
    return (
      <>
        {/* ...and manually pass props down to children... booo */}
        <PostHeader id={this.props.id} />
      </>
    );
  }
}
```

Hooks eliminate both the need to use `<Route render>` to access the router's internal state (the `match`) _and_ the need to pass props around manually to propagate that state to child components.

Another way to say this is to think about `useParams()` kind of like `useState()` for stuff on router context. The router knows some state (the current URL params) and lets you access it whenever you want with a hook. Without the hook we need a way to manually forward state to elements lower in the tree.

Let's look at another quick example of how hooks make React Router v6 a lot more powerful than v5. Let's assume you want to send a "pageview" event to your analytics service whenever the current location changes. In v6, [the `useLocation()` hook](https://reactrouter.com/docs/en/v6/api#uselocation) has you covered:

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function App() {
  let location = useLocation();
  useEffect(() => {
    window.ga("set", "page", location.pathname + location.search);
    window.ga("send", "pageview");
  }, [location]);
}
```

Of course, thanks to the functional composition that hooks provide, you'll probably just want to wrap all that up into a hook like:

```tsx
import { useAnalyticsTracking } from "./analytics";

function App() {
  useAnalyticsTracking();
  // ...
}
```

Again, in a world without hooks you'd have to do something weird like render a standalone `<Route path="/">` that renders `null` just so you can access the `location` as it changes. Also, without `useEffect()` for triggering side effects you'd have to do the `componentDidMount` + `componentDidUpdate` dance to make sure you send pageview events only when the `location` changes.

```tsx
// React Router v5 code
import * as React from "react";
import { Switch, Route } from "react-router-dom";

class PageviewTracker extends React.Component {
  trackPageview() {
    let { location } = this.props;
    window.ga("set", "page", location.pathname + location.search);
    window.ga("send", "pageview");
  }

  componentDidMount() {
    this.trackPageview();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location !== this.props.location) {
      this.trackPageview();
    }
  }

  render() {
    return null; // lol
  }
}

class App extends React.Component {
  return (
    <>
      {/* This route isn't really a piece of the UI, it's just here
          so we can access the current location... */}
      <Route path="/" component={PageviewTracker} />

      <Switch>
        {/* your actual routes... */}
      </Switch>
    </>
  );
}
```

That code is crazy, right? Well, those are the kinds of shenanigans you have to pull when you don't have hooks.

So to sum it up: we are publishing a new major version of React Router so you can ship smaller, more efficient apps which will in turn lead to better user experiences. It really is that simple.

You can check out the full list of hooks available in v6 [in our API docs](https://reactrouter.com/docs/en/v6/api).

> Still using `React.Component`? Don't worry, we still support class components! [See this GitHub thread for more info](https://github.com/remix-run/react-router/issues/8146#issuecomment-947860640).

## Routing Improvements

Remember `react-nested-router`? Probably not. But That's what we called React Router before we got the `react-router` package name on npm (Thanks, Jared!). React Router has always been about _nested routes_, though the way we express them has changed slightly over time. I'll show you what we've come up with for v6, but first let me give you a little backstory about v3, v4/5, and Reach Router.

In v3 we nested `<Route>` elements directly inside one another in one giant route config, as in [this example](https://github.com/remix-run/react-router/blob/v3/docs/guides/RouteConfiguration.md). Nested `<Route>` elements are a great way to visualize your entire route hierarchy. However, the implementation we had in v3 made it difficult to do code-splitting since all your route components ended up in the same bundle (this was before `React.lazy()`). So as you added more routes, your bundle just kept growing. Also, the `<Route component>` prop made it difficult to pass custom props through to your components.

In v4 we were optimizing for large apps. Code splitting! Instead of nesting `<Route>` elements in v4 you would just nest your own components and put another `<Switch>` in child components. You can see how it works in [this example](https://v5.reactrouter.com/web/guides/quick-start). This made it easy to build large apps because code splitting a React Router app was the same as code splitting any other React app and you could use one of several different tools available at that time for code splitting in React that had nothing to do with React Router. However, one unintended side effect of this approach was that `<Route path>` would only ever match the beginning of a URL pathname since each route component probably had more child routes somewhere further down the tree. So React Router v5 apps have to use `<Route exact>` every time they don't have child routes (every single leaf route). Oops.

In our experimental [Reach Router](https://reach.tech/router/) project, we borrowed an idea from Preact Router and did automatic route ranking to try and figure out which route best matches the URL, regardless of the order in which it was defined. This is a significant improvement on v5's `<Switch>` element and helps developers avoid bugs that result from defining routes in the wrong order, thereby creating unreachable routes. However, Reach Router's lack of a `<Route>` component caused some pain when using TypeScript since every one of your route components also had to accept route-specific props like `path` (I wrote [more about this here](https://gist.github.com/mjackson/d54b40a094277b7afdd6b81f51a0393f)).

So where does that leave us in React Router v6? Well, ideally we could have the best features of every API we've explored so far, _while also avoiding the problems they had_. Specifically, we want:

- The readability of co-located, nested `<Route>`s that we had in v3 but also with support for code splitting and passing custom props through to your route components
- The flexibility of splitting routes across multiple components that we had in v4/5 without littering `exact` props all over the place
- The power of route ranking that we had in Reach Router without cluttering your route component's prop types

Oh, and we'd also like [the object-based routing API](https://github.com/remix-run/react-router/blob/v3/docs/guides/RouteConfiguration.md#configuration-with-plain-routes) we had in v3 that allowed you to define your routes as plain JavaScript objects instead of `<Route>` elements as well as the static match and render functions we provided in v4/5 in the `react-router-config` add-on.

Well, needless to say we are _very happy_ to introduce a routing API that meets all of these requirements. Check out [the v6 API in the docs on our website](https://reactrouter.com/docs/en/v6/getting-started/overview). It actually looks a lot like v3:

```tsx
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
// import your route components too

render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="teams" element={<Teams />}>
          <Route path=":teamId" element={<Team />} />
          <Route path="new" element={<NewTeamForm />} />
          <Route index element={<LeagueStandings />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>,
  document.getElementById("root"),
);
```

However, if you look closely you'll see a few subtle improvements informed by our work over the years:

- We're using a `<Routes>` instead of `<Switch>`. Instead of scanning the routes in order, `<Routes>` automatically picks the best one for the current URL. It also allows you to spread routes across your entire app instead of defining them all up front as a prop to `<Router>` as we did in v3.
- The `<Route element>` prop allows you to pass custom props (even `children`) to your route elements. It also makes it easy to [lazily load your route element using `<React.Suspense>`](https://github.com/remix-run/react-router/blob/2ee81d71fa9e8cd980a3d3e92bf9fab81e2efdea/examples/lazy-loading/src/App.tsx#L42-L46) in case it's a `React.lazy()` component. We wrote more about the advantages of the `<Route element>` API [in the instructions for upgrading from v5](https://reactrouter.com/docs/en/v6/upgrading/v5#advantages-of-route-element).
- Instead of adding `<Route exact>` to all of your leaf routes to opt out of deep matching, you can use a `*` at the end of your route path to _opt in_ to deep matching, so you can still split your route config like this:

```tsx
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="users" element={<Users />}>
          <Route index element={<UsersIndex />} />

          {/* This route will match /users/*, allowing more routing
              to happen in the <UsersSplat> component */}
          <Route path="*" element={<UsersSplat />} />
        </Route>
      </Route>
    </Routes>
  );
}

function UsersSplat() {
  // More routes here! These won't be defined until this component
  // mounts, preserving the dynamic routing semantics we had in v5.
  // All paths defined here are relative to /users since this element
  // renders inside /users/*
  return (
    <Routes>
      <Route path=":id" element={<UserProfile />}>
        <Route path="friends" element={<UserFriends />} />
        <Route path="messages" element={<UserMessages />} />
      </Route>
    </Routes>
  );
}
```

There's so, so much more to our routing API that I'd love to show you here, but it's difficult to do it justice in a blog post. But luckily, you can read code. So I'll just link to a few examples that hopefully will speak louder than what I can write here. Each example has a button that allows you to launch it in an online editor so you can play around with it.

- [Our "basic" example that lets you play around with our new `<Routes>`, `<Route>`, `<Outlet>`, and `<Link>` APIs](https://github.com/remix-run/react-router/tree/main/examples/basic)
- [Using JavaScript objects to define your routes instead of `<Route>` elements](https://github.com/remix-run/react-router/tree/main/examples/route-objects)
- [Lazy loading (code splitting) both individual route elements and entire portions of your route hierarchy using `React.lazy()`](https://github.com/remix-run/react-router/tree/main/examples/lazy-loading)
- [Using a `basename` to define portable React Router apps in the same codebase, each one "mounted" at a different URL pathname prefix](https://github.com/remix-run/react-router/tree/main/examples/multi-app)

Feel free to [check out the rest of the v6 examples here](https://github.com/remix-run/react-router/tree/main/examples) and be sure to send us a PR if we missed one you'd like to see!

One additional feature that we brought over from v3 is first-class support for layout routes in the form of a new `<Outlet>` element. You can read more about layouts [in the v6 overview](https://reactrouterdotcom.fly.dev/docs/en/v6/getting-started/overview#nested-routes).

This really is the most flexible and powerful routing API we've ever designed, and we are really excited about the kinds of apps it's going to let us build.

## Relative Routes and Links

Another major improvement in React Router v6 is relative `<Route path>` and `<Link to>` values which we [wrote about at length](https://reactrouter.com/docs/en/v6/upgrading/v5#relative-routes-and-links) in the upgrading guide for React Router v5. Basically what it boils down to is this:

- Relative `<Route path>` values are always relative to the parent route. You don't have to build them from the / anymore.
- Relative `<Link to>` values are always relative to the route path. If it only includes a search string (i.e. `<Link to="?framework=react">`) it is relative to the current location's pathname.
- Relative `<Link to>` values are less ambiguous than `<a href>` and will always point to the same place, regardless of whether or not the current URL has a trailing slash.

Please also see [the notes on `<Link to>` values](https://reactrouter.com/docs/en/v6/upgrading/v5#note-on-link-to-values) in the v5 upgrade guide to learn more about how relative `<Link to>` values are less ambiguous than `<a href>` values and how you can link back "up" to parent routes using leading `..` segments.

Relative routes and links are a huge step toward making the router easier to use by not requiring you to build absolute `<Route path>` and `<Link to>` values in your nested routes. Really, this is the way it should have always worked, and we think you'll really enjoy how easy and intuitive it is to build apps this way.

> Note: Absolute paths still work in v6 to help make upgrading easier. You can even ignore relative paths altogether and keep using absolute paths forever if you'd like. We won't mind.

## Upgrading to React Router v6

We want to be very clear about this: **React Router v6 is the successor to all previous versions of React Router including v3 and v4/5. It is also the successor to Reach Router**. We encourage all React Router and Reach Router users to upgrade to v6 if possible. We have some big plans for v6, and we don't want you to be left out when we introduce some really cool stuff in 6.x! (Yes, even you v3 users clinging to your `onEnter` hooks are not going to want to miss this).

However, we realize that getting everyone to upgrade is a pretty ambitious goal for a set of libraries with 34M downloads each month. We are already working on a backwards compat layer for React Router v5 users and will be testing it with several customers soon. Our plan is to develop a similar layer for Reach Router users as well. If you have a large app and upgrading to v6 seems daunting, don't worry. Our backwards compat layer is on the way. Also, v5 will continue to receive updates into the foreseeable future, so don't rush it.

If you just can't wait and you think you'd like to take on the upgrade yourself, here are a few links that should help you:

- [Upgrading to v6 from v5](https://reactrouter.com/docs/en/v6/upgrading/v5)
- [Migrating to v6 from Reach Router](https://reactrouter.com/docs/en/v6/upgrading/reach)

Along with the official upgrade guides, I've published a few notes that should help you get started on the migration slowly. Remember, **the goal with any migration is to be able to do some work, and then ship it**. Nobody likes a long-running upgrade branch!

Here are some notes on deprecated patterns along with fixes that you can implement today in your v5 app before you ever attempt to upgrade to v6:

- [Handling Redirects in v6](https://gist.github.com/mjackson/b5748add2795ce7448a366ae8f8ae3bb)
- [Composing `<Route>` in v6](https://gist.github.com/mjackson/d54b40a094277b7afdd6b81f51a0393f)

Again, please don't feel pressured to do this migration. We think React Router v6 is the best router we've ever built, but you probably have bigger problems to deal with at work. We'll be here when you're ready to upgrade.

If you're a Reach Router user worried about losing the accessibility features it provides, you'll be very interested to know we are still working on that problem. It turns out Reach Router's automatic focus management actually makes things worse in some cases than doing nothing at all. We realized we need more information than just location changes in order to properly manage focus. However, it was a worthwhile experiment and we learned a lot. Our next project is going to help you build more accessible apps than ever...

## The Future: Remix

React Router provides the foundation for many of the most ambitious and impressive web apps around today. It's an amazing feeling for me to open the developer console of a web app like Netflix, Twitter, Linear, or Coinbase and see React Router being used for the flagship apps of these businesses. Each of these companies has an exceptional pool of talent and resources, and they and many others choose to build their business on React and React Router.

One of the things people really love about React Router is how it does its job and then gets out of your way. It has never really tried to be an opinionated framework, so it fits right into your existing stack. Maybe you're server rendering, maybe not. Maybe you're code splitting, maybe not. Maybe you're rendering a dynamic site with client-side routing and data, or maybe you're just rendering a bunch of static pages. React Router will happily do whatever you want.

But how do you build the rest of your app? Routing is just one piece. What about data loading and mutations? What about caching and performance? Should you be server rendering? What's the best way to do code splitting? How should you deploy and host your app?

It just so happens that we have some pretty strong opinions about all of this. That's why [we're building Remix](https://remix.run), a new web framework that is going to help you build better websites.

As web apps have become increasingly complex in recent years, front-end web development teams have taken on much more responsibility than ever before. Not only do they have to know how to write HTML, CSS, and JavaScript. They also need to know about TypeScript, compilers, and build pipelines. In addition, they need to understand bundlers and code splitting and understand how the app loads as customers navigate around the site. It's a lot to think about! Remix and the amazing Remix community are going to be like an extra member of your team that can help you manage and make smart decisions about how to do all of this and more.

We've been working on Remix for over a year now and recently [secured some funding](seed-funding-for-remix) and hired a team to help us build it. We will be releasing the code under an open source license before the end of the year. And React Router v6 is at the heart of Remix. As Remix moves forward and gets better and better so does the router. You will continue to see a steady stream of releases and improvements from us on both React Router and Remix.

We are incredibly grateful for all the support we've received up to this point, and for so many friends and customers who have believed in us over the years. And we sincerely hope you enjoy using React Router v6 and Remix!
