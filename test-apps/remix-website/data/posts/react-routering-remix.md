---
title: React Router-ing Remix
summary: We brought all the Remix goodies over to React Router and made improvements in the process. Now it's time to bring those improved APIs back over to Remix where they started!
featured: false
date: 2022-11-02
image: /blog-images/posts/remixing-react-router/image.jpg
imageAlt: React Router Logo
authors:
  - Matt Brophy
---

Earlier this year we started an undertaking to [Remix React Router][remixing-react-router] with the aim of bringing all of the Remix Data API's (`loaders`, `actions`, `fetchers`, etc.) over to React Router. With the recent release of [React Router v6.4.0][react-router-6.4.0] we're proud to report that we've completed that effort...and we think we've made them even better 😃. Not only have we fixed a few edge case bugs, but we've stabilized some APIs and introduced some really great new ones. Here's a quick overview of the changes but we encourage you to check out the blog post for more information.

- 🆕 Programmatically revalidate with `useRevalidator`
- 🆕 Separate your critical/non-critical data with `defer`/`Await`
- 🆕 Grab a specific route's loader data with `useRouteLoaderData`
- ✅ `unstable_shouldReload` has stabilized as `shouldRevalidate`
- 🔥 New and improved `<ScrollRestoration getKey>` method allows finer-grained control over scroll restoration
- 🔥 Catch and Error boundaries have been combined into a single `errorElement`
- 🐞 `fetcher.load` calls now participate in revalidation - as they should have all along!

## React-Routering Remix

Now we get to flip the script and start **React Router-ing Remix** so we can bring these changes back over to Remix users (and delete a _bunch_ of Remix code in the process). The good news for all you folks is that we plan to do it iteratively and without a major release 🤯. We thought the approach we're using was pretty cool so we wanted to share it with you all.

You can think of Remix's architecture as having 4 primary aspects:

1. Server navigation + data fetching
2. Server HTML rendering
3. Client-side hydration
4. Client navigation + data-fetching

These 4 sections also happen to be nicely decoupled, so they provide us clean boundaries to approach this in an iterative fashion to avoid a single big-bang release. This should mean a much smoother integration path for Remix users!

### Step 1 - Server Navigation and Data Fetching

We'll first update Remix's server runtime to use React Router's new `unstable_createStaticHandler` to do server-side data-fetching, and once we're comfortable we can release that without touching steps 2 through 4. Even better - we can break this down into individual efforts for resource route requests, client-side navigation data fetch requests, and document requests.

_Note: `createStaticHandler` is published as unstable in `6.4.0` in case we come across required changes during this process. We'll stabilize it once we've completed the Remix integration._

We're planning to do these one by one using Martin Fowler's [Strangler Fig][strangler-fig] pattern so we can gain the highest confidence that we haven't introduced any regressions (shout out to `@DavidKPiano` for re-surfacing this pattern in my brain [a few months ago][davidkpiano-tweet]!). If you're unfamiliar with this pattern, the general gist of it is that you write the new code alongside the old code and slowly switch portions over. We can take this even further with a feature-flagged approach that keeps both paths active and allows for validations during tests and at runtime.

Here's a simplified example of what this might look like for a resource route request in Remix

```js
function handleResourceRouteRequest({ request }) {
  // If the flag is enabled, clone the request so we can use it twice
  let response = processResourceRouteRequest(
    ENABLE_NEW_STUFF ? request.clone() : request,
  );

  // When our flag is enabled, send this request through the new
  // code path, while also asserting that we get back an identical
  // response
  if (ENABLE_NEW_STUFF) {
    let newResponse = processResourceRouteRequestNew(request);
    assertResponses(response, newResponse);
    return newResponse;
  }

  return response;
}
```

This approach gives us a number of benefits:

- The feature flag allows us to strip the new code paths out at build time, so we won't be including any of this new code in published remix releases (until we're ready)
- Therefore, we can merge this code directly into the `dev` branch instead of maintaining a long-lived feature branch
- The assertions can be used for all of our unit and integration tests to make sure nothing breaks, and also enabled at runtime for local app development, which allows us to better test this out on real Remix apps
- Once we're confident the new code paths are ready to go, we can alter the feature flags from a "run both" approach to a "run one or the other" approach, leaving us a very quick rollback strategy should anything go awry when we publish the new code paths
- Finally, the feature flags give us nice and easy references of what to delete once we're all done 🪓

### Step 2 - Server HTML Rendering

Once we're done wth server-side data fetching, we can move onto server-side HTML rendering (using React Router's `unstable_StaticRouterProvider`). This is another aspect we can (sort of) do independently. We can render HTML on the server using the new APIs, but we won't be able to hydrate that on the client (using the old APIs) without some nasty code forks to determine whether to read from the old or new contexts. Thankfully, idiomatic Remix apps work without JavaScript, so we can validate our tests and apps without JS during this step. We obviously won't ship after Step 2, but we'll be able to gain a pretty high level of confidence in our SSR before moving onto step 3. Again we'll use a flag to enable both paths and perform some level of HTML assertions between the old and new.

The fun part here is that this step is where we start to fully realize Michael's vision of Remix being a ["compiler for React Router"][michael-tweet]. Now that react-router knows how to do all the cool data fetching stuff, Remix just compiles a set of conventional route files on disk into the appropriate routes expected by React Router. Once those routes are created, it just hands them off to React Router for the heavy lifting 💪!

## Step 3 - Client-side Hydration

On to client-side hydration! This is where we'll remove the vast majority of the Remix code (bye-bye Transition Manager - we'll always love you 🙃). In the same vein as above, Remix simply needs to leverage the route manifest provided by the server to generate a route tree to hand off to `createBrowserRouter` and then `RouterProvider` does the rest. The _super_ cool part is that Remix gets to use the _exact same loader and action_ for all of it's routes, since all they do is make a `fetch` to the Remix server with a `_data` param! This probably won't go through the feature flag since we can't exactly hydrate the document twice 🤷‍♂️.

### Step 4 - Client navigation and data-fetching

This might be the most incorrectly asserted phrase in software development, but we're going to be stubborn here and use it again -- once we finish step 3, client side routing and data-fetches should **Just Work™️** since that's entirely handled by React Router 6.4 now!

## Backwards Compatibility

We should note again that we're planning to do this all as minor Remix 1.x releases (likely one release for step 1, and another for steps 2-4). To maintain backwards compatibility, there will be some work to do in steps 2 and 3. Here's a few examples:

- `useTransition` has been renamed to `useNavigation` in React Router 6.4, so we'll mark `useTransition` as deprecated but keep it around
- React Router flattened the `submission` field and removed the `type` field from navigations (formerly transitions) and fetchers, so we'll use wrapper hooks to add those back to `useTransition` and `useFetcher`
- React Router doesn't have the concept of separate Error and Catch Boundaries, so we'll ensure they remain functional

Where possible (and we hope this is all cases), we will add feature flags to `remix.config.js` allowing you to opt-into the new Remix v2 behavior at your convenience, while providing backwards compatible-behavior if you do not opt-in.

## Outro

We're really excited for this next step, and even more excited about some of the possibilities it opens up for the future of both React Router and Remix (did somebody say Preact?). Please keep an eye on the repos for updates and as always, hit us up on [Discord](https://rmx.as/discord) or [Twitter](https://twitter.com/remix_run) if you have any questions or excitement about any or all of this :)

[remixing-react-router]: https://remix.run/blog/remixing-react-router
[react-router-6.4.0]: https://remix.run/blog/react-router-v6.4
[strangler-fig]: https://martinfowler.com/bliki/StranglerFigApplication.html
[davidkpiano-tweet]: https://twitter.com/DavidKPiano/status/1546139706580238342
[michael-tweet]: https://twitter.com/mjackson/status/1487196075861561347
