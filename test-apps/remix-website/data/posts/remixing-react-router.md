---
title: Remixing React Router
summary: Remix picked up where React Router v3 left off, and now almost everything great about Remix is coming back to React Router!
featured: true
date: 2022-03-23
image: /blog-images/posts/remixing-react-router/image.jpg
imageAlt: React Router Logo
authors:
  - Ryan Florence
---

The first versions of React Router actually had an async hook to help with data loading called `willTransitionTo`. Nobody really knew how the heck to use React at the time and we were no exception. It wasn't _great_, but it was at least going in the right direction.

For better or for worse, we went all in on components for React Router v4 and removed the hook. With `willTransitionTo` gone, and components our primary tool, nearly every React Router app today fetches data inside of components.

We've learned that fetching in components is the quickest way to the slowest UX (not to mention all the content layout shift that usually follows).

It's not just the UX that suffers either. The developer experience gets complex with all the context plumbing, global state management solutions (that are often little more than a client side cache of server side state), and every component with data needing to own it's own loading, error, and success states. Very few happy paths!

As we've built Remix, we've gotten a lot of practice leaning on React Router's nested route abstraction to solve all of these problems at once. Today, we're happy to announce we have begun work on bringing these data APIs to React Router, but this time it's _incredibly good_.

## tl;dr

Nearly everything great about Remix's data and async UI management is coming to React Router.

- All the data components, hooks, and nitty gritty async data management from Remix are coming to React Router.
  - Data loading with `<Route loader />`
  - Data mutations with `<Route action />` and `<Form>`
  - Automatic handling of interruptions, errors, revalidation, race conditions, and more.
  - Non-navigation data interactions with `useFetcher`
- A new package, `@remix-run/router` will combine all the relevant functionality from History, React Router's matching, and Remix's data management in a vue-agnostic--excuse me--a _view_ agnostic way. This is just an internal dependency, you'll still `npm install react-router-dom`.

## Component Fetching and Render Fetch Chains

When you fetch inside of components, you create what we call **render+fetch chains** that artificially slow down your page loads and transitions by fetching several data dependencies _in sequence_ instead of _in parallel_.

Consider these routes:

```jsx
<Routes>
  <Route element={<Root />}>
    <Route path="projects" element={<ProjectsList />}>
      <Route path=":projectId" element={<ProjectPage />} />
    </Route>
  </Route>
</Routes>
```

Now consider that each of these components fetches their own data:

```jsx
function Root() {
  let data = useFetch("/api/user.json");

  if (!data) {
    return <BigSpinner />;
  }

  if (data.error) {
    return <ErrorPage />;
  }

  return (
    <div>
      <Header user={data.user} />
      <Outlet />
      <Footer />
    </div>
  );
}
```

```jsx
function ProjectsList() {
  let data = useFetch("/api/projects.json");

  if (!data) {
    return <MediumSpinner />;
  }

  return (
    <div style={{ display: "flex" }}>
      <ProjectsSidebar project={data.projects}>
      <ProjectsContent>
        <Outlet />
      </ProjectContent>
    </div>
  );
}
```

```jsx
function ProjectPage() {
  let params = useParams();
  let data = useFetch(`/api/projects/${params.projectId}.json`);

  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.notFound) {
    return <NotFound />;
  }

  if (data.error) {
    return <ErrorPage />;
  }

  return (
    <div>
      <h3>{project.title}</h3>
      {/* ... */}
    </div>
  );
}
```

When the user visits `/projects/123` what happens?

1. `<Root>` fetches `/api/user.json` and renders `<BigSpinner/>`
2. Network responds
3. `<ProjectsList>` fetches `/api/projects.json` and renders `<MediumSpinner/>`
4. Network responds
5. `<ProjectPage>` fetches `/api/projects/123.json` and renders `<div>Loading...</div>`
6. Network responds
7. `<ProjectPage>` finally renders and the page is complete

Component fetching like this makes your app ridiculously slower than it could be. Components initiate fetches when they mount, but the parent component's own pending state blocks the child from rendering and therefore from fetching!

This is a **render+fetch chain**. All three fetches in our sample app could logically go out in parallel, but they can't because they're coupled to UI hierarchy and blocked by parent loading states.

If each fetch takes one second to resolve, the whole page takes at least three seconds to render! This is why so many React apps have slow loads and slow transitions.

<img alt="network diagram showing sequential network requests" src="/blog-images/posts/remixing-react-router/network1.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Coupling data fetching to components leads to render+fetch chains</figcaption>

The solution is to decouple _initiating fetches_ from _reading results_. That's exactly what the Remix APIs do today, and what React Router will do soon. By initiating your fetches at nested route boundaries the request waterfall chain is flattened and 3x faster.

<img alt="network diagram showing parallel network requests" src="/blog-images/posts/remixing-react-router/network2.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Route fetching parallelizes requests, eliminating slow render+fetch chains</figcaption>

It's not just about the user experience though. The amount of problems the new APIs solve all at once has a huge impact on the simplicity of your code and the fun you have while coding.

## What's Coming

We're still bike-shedding the names of a few things, but here's what you can expect:

```jsx
import * as React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLoaderData,
  Form,
} from "react-router-dom";

ReactDOM.render(
  <BrowserRouter>
    <Routes
      // if you're not server rendering, this manages the
      // initial loading state
      fallbackElement={<BigSpinner />}
      // any rendering or async loading and mutation errors will
      // automatically be caught and render here, no more error
      // state tracking or render branching
      exceptionElement={<GlobalErrorPage />}
    >
      <Route
        // Loaders provide data to route component and are initiated
        // when the URL changes
        loader={({ signal }) => {
          // React Router speaks the Web Fetch API, so you can return
          // a web fetch Response and it'll automatically be
          // deserialized with `res.json()`. No more useFetch hooks
          // and messing with their pending states in every component
          // that needs them.
          return fetch("/api/user.json", {
            // It also handles navigation interruptions and (as long as
            // you pass the signal) cancels the actual fetch.
            signal,
          });
        }}
      >
        <Route
          path="projects"
          element={<Projects />}
          // exceptions bubble, so you can handle them in context or
          // just let them bubble to the top, tons of happy paths!
          exceptionElement={<TasksErrorPage />}
          loader={async ({ signal }) => {
            // You can also unwrap the fetch yourself and write
            // simple `async/await` code (try that inside a useEffect 🥺).
            // You don't even have to `fetch`, you can get data from
            // anywhere (localStorage, indexedDB whatever)
            let res = await fetch("/api/tasks.json", { signal });

            // if at any point you can't render the route component
            // based on the data you're trying to load, just `throw` an
            // exception and the exceptionElement will render instead.
            // This keeps your happy path happy, and your exception path,
            // uh, exceptional!
            if (res.status === 404) {
              throw { notFound: true };
            }

            return res.json();
          }}
        >
          <Route
            path=":projectId"
            element={<Projects />}
            // a lot of your loading is gonna be this simple, React
            // Router will handle all the pending states and expose it
            // to you so you can build pending/optimistic UI
            loader={async ({ signal, params }) =>
              fetch(`/api/projects/${params.projectId}`, { signal })
            }
          />
        </Route>
        <Route index element={<Index />} />
      </Route>
    </Routes>
  </BrowserRouter>,
);
```

```jsx
function Root() {
  // components access route data with this hook, data is guaranteed
  // to be here, error free, and no pending states to deal with in
  // every component that has a data dependency (also helps with
  // removing Content Layout Shift).
  let data = useLoaderData();

  // the transition tells you everything you need to build pending
  // indicators, busy spinners, optimistic UI, and side effects.
  let transition = useTransition();

  return (
    <div>
      {/* You can put global navigation indicators at the root and
          never worry about loading states in your components again,
          or you can get more granular around Outlets to build
          skeleton UI so the user gets immediate feedback when a link
          is clicked (we'll show how to do that another time) */}
      <GlobalNavSpinner show={transition.state === "loading"} />
      <Header user={data.user} />
      <Outlet />
      <Footer />
    </div>
  );
}
```

## Data Mutations Too!

Not only are we speeding up your apps with these data loading APIs, but we've figured out how to bring the data mutation APIs over as well! When you have a routing and data solution that includes both reads and writes, you can solve a whole bunch of problems all at once.

Consider this "new project" form.

```jsx
function NewProjectForm() {
  return (
    <Form method="post" action="/projects">
      <label>
        New Project: <input name="title" />
      </label>
      <button type="submit">Create</button>
    </Form>
  );
}
```

Once you have the UI, the only other thing you need is the the action on the route the form action points to:

```jsx
<Route
  path="projects"
  element={<Projects />}
  // this action will be called when the form submits because it
  // matches the form's action prop, routes can now handle all of
  // your data needs: reads AND writes.
  action={async ({ request, signal }) => {
    let values = Object.fromEntries(
      // React Router intercepted the normal browser POST request and
      // provides it to you here as a standard Web Fetch Request. The
      // formData as serialized by React Router and available to you
      // on the request. Standard HTML and DOM APIs, nothing new.
      await request.formData(),
    );

    // You already know the web fetch API because you've been using it
    // for years like this:
    let res = await fetch("/api/projects.json", {
      signal,
      method: "post",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json; utf-8" },
    });

    let project = await res.json();

    // if there's a problem, just throw an exception and the
    // exception element will render, keeping the happy path happy.
    // (there are better things to throw than errors if you keep
    // reading)
    if (project.error) throw new Error(project.error);

    // now you can return from here to render this route or return a
    // redirect (which is really a Web Fetch Response, ofc) to go
    // somewhere else, like the new project!
    return redirect(`/projects/${project.id}`);
  }}
/>
```

That's it. You only have to write the UI and the actual application-specific mutation code in a simple `async` function.

There are no errors or success states to dispatch, no useEffect dependencies to worry about, no cleanup functions to return, no cache keys to expire. You have one concern: perform the mutation and if something goes wrong, throw. The async UI, mutation concerns, and exception rendering paths have been completely decoupled.

From there, React Router will handle all of these concerns for you:

- calls the action on form submission (no more event handlers, `event.preventDefault()`, and global data context plumbing)
- renders the exception boundary if anything is thrown in the action (no more dealing with error and exception states in every component with a mutation)
- revalidates the data on the page by calling the loaders for the page (no more context plumbing, no more global stores for server state, no cache key expirations, way less code)
- handles interruptions if the user is click happy, avoiding out-of-sync UI
- handles revalidation race conditions when multiple mutations and revalidations are in flight at once

Because it's handling all of this for you, it can expose everything it knows through one simple hook: `useTransition`. This is how you provide the user with feedback to make your app feel rock solid (and the reason we put React on the page in the first place!)

```jsx
function NewProjectForm() {
  let transition = useTransition();

  let busy = transition.state === "submitting";

  // This hook tells you everything--what state the transition is
  // in ("idle", "submitting", "loading"), what formData is being
  // submitted to the server for optimistic UI and more.

  // You can build the fanciest SPA UI your designers can dream up...
  return (
    <Form method="post" action="/projects">
      <label>
        New Project: <input name="title" />
      </label>
      {/* ... or just disable the button 😂 */}
      <button type="submit" disabled={busy}>
        Create
      </button>
    </Form>
  );
}
```

If most of your app deals with fetching and posting to API routes, get ready to delete a lot of code when this ships.

## Built for Abstraction

Many devs may look at this API and think that it's just too much code in the route config. Remix is able to co-locate loaders and actions with the route modules and builds the route config itself from a file system. We expect people to create similar patterns for their apps.

Here's a very simple example of how it could look to co-locate these concerns without a lot of effort. Create a "Route module" with a dynamic import to the real thing. This gets you code splitting as well as a cleaner Route configuration.

```jsx
export async function loader(args) {
  let actualLoader = await import("./actualModule").loader;
  return actualLoader(args);
}

export async function action(args) {
  let actualAction = await import("./actualModule").action;
  return actualAction(args);
}

export const Component = React.lazy(() => import("./actualModule").default);
```

```jsx
import * as Tasks from "./tasks.route";

// ...
<Route
  path="/tasks"
  element={<Tasks.Component />}
  loader={Tasks.loader}
  action={Tasks.action}
/>;
```

## Suspense + React Router = ❤️

React Server Components, Suspense and Streaming, though unreleased, are exciting features shaping up in React. We have these APIs in mind as we do this work in React Router.

These React APIs are designed for a system that initiates data loading **before** it renders. They are not designed to define where you _initiate_ fetches, but rather _where you access_ the results.

- Suspense defines where you need to await an already initiated fetch, pending UI, and when to "flush" the HTML when streaming
- React Server Components move data loading and rendering to the server
- Streaming renders React Server Components as data becomes available and sends HTML chunks at Suspense boundaries for the initial SSR.

None of those APIs are designed to _initiate_ loading, but rather how and where to render when the data becomes available. If you initiate your fetches inside of Suspense boundaries, you're still just fetching in components, with all the same performance problems that exist in React Router apps today.

React Router's new data loading APIs are just the thing Suspense expects! When the url changes, React Router initiates the fetches for every matching route before rendering. This gives these new React features everything they need to shine ✨.

## Repository Merge

As we've been developing these features, our work spans three repositories: History, React Router, and Remix. This is a pretty bad DX for us to maintain the tooling, issues, and PRs across them all when everything is so related. It's also difficult for the community to provide contributions.

We've always thought of Remix as "just a compiler and server for React Router". It's time they moved in together.

Logistically this means we will:

- Merge Remix into the React Router repository because React Router is the primary dependency of everything we're doing. It also has the longest history on the web with issues, PRs, and back links over the last 7 years. Remix is only a few months old.
- Rename and archive the Remix repo from "remix" to "remix-archive"
- Rename the "react-router" repo to "remix", where all the packages live together
- Keep publishing everything to NPM under the same names as before. This is just source code/project shuffling, your package.json will be unaffected

There's a lot of housework to be done, so expect to see issues/PRs get moved, merged, or closed on the repositories as we begin our merging efforts. We will be doing our best to maintain the git history of each repository because we believe that every contributor deserves their name on that commit!

Hit us up on [Discord](https://rmx.as/discord) or [Twitter](https://twitter.com/remix_run) if you have any questions or excitement about any or all of this :)
