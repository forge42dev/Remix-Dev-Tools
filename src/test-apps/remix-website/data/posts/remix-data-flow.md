---
title: Data Flow in Remix
summary: "Remix takes the idea of “one-way data flow” and extends it across the network, so your UI truly is a function of state: from the client to the server and back again."
date: 2022-06-22
image: /blog-images/headers/remix-data-flow.png
imageAlt: A graphic with the words “Loaders” -> “Component” -> “Action” connected by arrows and depicted cyclically.
authors:
  - Jim Nielsen
---

When React first appeared on the scene, one of its most compelling features was its “one-way data flow”. This is still outlined in the React docs under the page [“Thinking in React”][react-docs]

> The component at the top of the hierarchy will take your data model as a prop. If you make a change to your underlying data model and call `root.render()` again, the UI will be updated. You can see how your UI is updated and where to make changes. React’s **one-way data** flow (also called _one-way binding_) keeps everything modular and fast.

The idea is that data can only flow one-way through your app which therefore makes your app much easier to intuit, understand, and reason about.

![Illustration of the idea of one-way data flow depicting lines drawing a circular flow from view to action to state.][img-1]

This came to be summarized in the phrase: “UI is a function of state”, or `ui = fn(state)`. Whenever some state changes, due to an action, the view re-renders. To date, a number of sophisticated “state management” solutions have been created to facilitate building applications with this mental model.

The rarely-acknowledged problem here, however, is that this “one-way data flow” is a bit of a misnomer. It’s really a one-way data flow _on the client._ But having data exclusively on the client is rarely practical. Most of the time you need to persist data—to sync it—which means you need data to flow two ways: between the client and the server.

![Illustration of the flow “View -> Action -> State” framed in a browser on the left. On the right is an illustartion of a server with a database. Two arrows connect these two illustrations denoting network transfer.][img-2]

A lot of state management tools only help you manage state on the client but they don’t help you effectively cross [the network chasm](https://kentcdodds.com/blog/remix-the-yang-to-react-s-yin): the gap between the state on the client and the state on the server.

![Illustration of the flow “View -> Action -> State” framed in a browser on the left. On the right is an illustartion of a server with a database. Two arrows connect these two illustrations denoting network transfer. The visual emphasis is on the network part of the graphic with “?”s surrounding it.][img-3]

[Enter Remix](https://remix.run/docs/en/v1/guides/data-loading): “one of the primary features of Remix is simplifying interactions with the server to get data into components.” Remix extends the flow of data across the network, making it truly one-way and cyclical: from the server (state), to the client (view), and back to the server (action).

![Illustration of the flow “View -> Action -> State” crossing between the browser and the server.][img-4]

When it’s said that your “UI is a function of state”, a more nuanced way of disentangling the assumptions in that statement would be: UI is a function of _your remote state_ and _your local state._ In a traditional React app, _all state_ lives on the client and the pieces you want to persist must jump outside “the one-way data flow” and be synced across the network to a server. As you can imagine, this is an area prone to bugs.

In Remix, however, the idea of "UI as a function of state" is transformed because remote state can be more easily disentangled from local state. “What’s the difference,” you ask? Think of it this way.

_Remote state_ is any data that needs to persist, like user data. This state (e.g. how many unread notifications does the user have?) is stored _off the client_ and reconciles into your app from Remix mechanisms like [loaders](https://remix.run/docs/en/v1/guides/data-loading) and [actions](https://remix.run/docs/en/v1/guides/data-writes).

(**Note:** Remix helps you cross the network chasm by also providing stateful information around the transmission of your persistent data via [transitions](https://remix.run/docs/en/v1.5.1/api/remix#usetransition) and [fetchers](https://remix.run/docs/en/v1/api/remix#usefetcher) — no need to track the status of every network request yourself via booleans like `isLoading` or enums like `initial | loading | success | failed`).

In contrast, _local state_ is ephemeral data which can be lost (e.g. via a refresh) without negatively impacting the user experience. This state (e.g. is the dropdown open which reveals the user’s notifications?) is stored on the client via mechanisms like React state or local storage. Importantly, it does not need to persist and sync across the network thereby reducing complexity and the potential for bugs.

![Illustration depicting a one-way flow of “remote data” between the client/server facilitated by remix. A one-way flow of “local data” is on the client exclusively facilitated by React and/or localStorage.][img-5]

Forms, fetchers, loaders, actions, these are all “state management” solutions in Remix (though we don’t call them that). They give you the tools to keep persistent state in sync between the client and the server, ensuring data flows cyclically one-way through your app and across the network: from loaders to a component to an action and back again.

![The words “Loader” -> “Action” -> “Component” shown in a circular diagram.][img-6]

With Remix, your UI becomes a function of state _across the network_, not just locally. An [interesting analogy](https://discord.com/channels/770287896669978684/770287896669978687/980184501726642186) to Remix’s data abstractions is React’s virtual DOM abstraction.

In React, you don’t worry about updating the DOM yourself. You set state and the virtual DOM does all the diffing to figure out how to make efficient updates to the DOM. Remix extends this idea to the API layer for persistent data.

In Remix, you don’t worry about keeping client-side state in sync with the server. You “set state” with a mutation and the loaders take over to refetch the most up-to-date data and make updates to your component views.

![Screenshot of code example in Remix illustrating the one-way, cyclical flow of data through an app. There’s a `loader` function whose code flows into the `Route` component whose code, via a `<Form>` flows into the `action` function whose code flows back into a loader again.][img-7]

Hopefully this helps illustrate how Remix drastically helps reduce the amount of complexity required to build better websites. As Kent says in [his talk at RenderATL][kent-renderatl], because Remix works before JavaScript that’s a win for your users because they get an experience supported by progressive enhancement. But it's also a win for you as a developer because you don’t need to build all the complexity traditionally coupled with state management solutions.

> You don't have to worry about application state management when you use Remix. Redux, Apollo, as cool as those tools are, you don't need them when you're using Remix because we don't even need client-side JavaScript at all for the whole thing to work…[think about the app that you’re building] and pretend that you can throw away all the code that has to do with application state management…that’s what it’s like when you work with Remix. If it can work without JavaScript in the browser, that means you don't need anything in the browser that requires state management.

[react-docs]: https://reactjs.org/docs/thinking-in-react.html
[kent-renderatl]: https://youtu.be/zED9ePuht4g?t=24852
[img-1]: /blog-images/posts/remix-data-flow/view-action-state.png
[img-2]: /blog-images/posts/remix-data-flow/view-action-state-server-client.png
[img-3]: /blog-images/posts/remix-data-flow/view-action-state-network.png
[img-4]: /blog-images/posts/remix-data-flow/view-action-state-server-client-network.png
[img-5]: /blog-images/posts/remix-data-flow/view-action-state-local-vs-remote.png
[img-6]: /blog-images/posts/remix-data-flow/loader-action-component.png
[img-7]: /blog-images/posts/remix-data-flow/loader-action-component-code.png
