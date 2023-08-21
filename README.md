<p align="center">
<img src="./assets/remix-dev-tools.png" style="display: block; margin: 0 auto;" align="middle" width="160" height="160" alt="Remix Development Tools"  />
</p>

# Remix Development Tools

![GitHub Repo stars](https://img.shields.io/github/stars/Code-Forge-Net/Remix-Dev-Tools?style=social)
![npm](https://img.shields.io/npm/v/remix-development-tools?style=plastic)
![GitHub](https://img.shields.io/github/license/Code-Forge-Net/Remix-Dev-Tools?style=plastic)
![npm](https://img.shields.io/npm/dy/remix-development-tools?style=plastic) 
![GitHub top language](https://img.shields.io/github/languages/top/Code-Forge-Net/Remix-Dev-Tools?style=plastic) 

Remix Development Tools is an open-source package designed to enhance your development workflow when working with Remix, a full-stack JavaScript framework for building web applications. This package provides a user-friendly interface consisting of three tabs, **Active Page**, **Terminal**, **Settings** and **Routes**, along with a side tab called **Timeline**. With Remix Development Tools, you can efficiently monitor and manage various aspects of your Remix projects, including page information, URL parameters, server responses, loader data, routes, and more.

## How it looks
### Active pages Tab
![active page tab](./assets/active-page.png)
### Routes Tab
![routes](./assets/routes.gif)
### Timeline
![timeline](./assets/timeline.gif)

## What's new?

## v2.1.3
- Deferred data support! You can see your deferred data in the active page tab now being loaded and swapped in realtime
- Settings option to change the default expansion level of json viewer (Default: 0)
### v2.1.0
 Detached mode support!


Json viewer improvements:
- Number of items in objects/arrays
- Copy to clipboard
- type of the value
- Doesn't close on revalidate anymore
- Different UI

## Features

### Active Page Tab

The **Active Page** tab in Remix Development Tools allows you to gain insights into the current page you are working on. It provides valuable information and data that can assist you in debugging and understanding the behavior of your application. 

Key features include:

- **URL Parameters**: Easily view and analyze the URL parameters associated with the current page.
- **Server Responses**: Inspect and review the server responses received by the application for the current page.
- **Loader Data**: Monitor and track the loader data used by the application during page rendering.
- **Outlet boundaries** Activate the **Show Route Boundaries** option to see each Outlet and route boundaries by coloring the background. This needs to make a GET request to the current route when the dev tools are mounted for the first time to work properly and hence it is locked behind a flag. You can enable it by passing `showRouteBoundaries` prop to `true` in the `RemixDevTools` component.

### Routes Tab

The **Routes** tab enables you to manage and explore the routes within your Remix project. This tab offers an intuitive interface to perform the following tasks:

- **Route Overview**: View an organized list of all the routes available in your project.
- **Wildcard Values**: Add and manage wildcard values for dynamic routing.
- **Browser Integration**: Open routes directly in your preferred web browser for quick testing and verification.
- **VS Code Integration**: Seamlessly connect to the Remix Forge VS Code extension and leverage its capabilities to open routes within your VS Code environment and easily add new routes.

### Timeline Tab

The **Timeline** side tab provides a timeline view of events occurring during the development process. This tab helps you track the sequence of actions and events, providing valuable insights into the execution flow of your application.

### Settings tab

The **Settings** tab allows you to tweak your Remix Development Tools to your needs. Allows you to tweak around the height of the dev tools,
the trigger position, the Remix Forge port and many more options to come.

### Terminal tab

The terminal tab allows you to run terminal commands from the Remix Dev Tools. This is useful for running commands like `npm run typecheck` or `npm run lint:fix` without having to switch to the terminal in VS code. The tab requires you to connect to Remix Forge VS Code extension to work properly. 

- You can press `Arrow Up` and `Arrow Down` to cycle through the history of commands you have run in the terminal.
- You can press `Arrow Left` and `Arrow Right` to cycle through all available commands in your projects package.json file.
- You can press `Ctrl + C` to cancel the current command.
- You can press `Ctrl + L` to clear the terminal.

### Detached mode

Detached mode allows you to un-dock the Remix Dev Tools from the browser and move it to a separate window. This is useful if you want to have the dev tools open on a separate monitor or if you want to have it open on a separate window on the same monitor.

## Getting Started

To install and utilize Remix Development Tools, follow these steps:

1. Install the package via npm:

```bash
npm install remix-development-tools -D
```

2. Add the following to your application `entry.client.tsx` file:

```diff
This might differ if you use <StrictMode> or some other wrappers around <RemixBrowser>, whats important is wrapping the start transition in a callback
-startTransition(() => {
-  hydrateRoot(
-   document,
-   <RemixBrowser />
-);
+});
+ const callback = () => startTransition(() => {
+   hydrateRoot(
+    document,
+    <RemixBrowser />
+  );
+});
+
+ if(process.env.NODE_ENV === "development") {
+   import("remix-development-tools").then(({ initClient }) => {
+     // Add all the dev tools props here into the client
+     initClient();
+     callback();
+   }); 
+ } else {
+  callback()
+ }
``` 

3. Add the following to your application `entry.server.tsx` file:

```diff
The important part is modifying the remixContext, this might differ based on the provider you are using.

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
-  return new Promise((resolve, reject) => {
+  return new Promise(async (resolve, reject) => {
    let shellRendered = false;
+    const context = process.env.NODE_ENV === "development" ? await import("remix-development-tools").then(({ initServer }) => initServer(remixContext)) : remixContext;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
-        context={remixContext}
+        context={context}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
```
4. Add the Remix Development Tools to your `root.tsx` file:

```diff
+ const RemixDevTools = process.env.NODE_ENV === 'development' ? lazy(() => import("remix-development-tools")) : null

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload /> 
+       {RemixDevTools ? (<Suspense><RemixDevTools /></Suspense>) : null}
      </body>
    </html>
  );
}
```
5. You're good to go!

## RemixDevTools props

The `RemixDevTools` component accepts the following props: 
- `requireUrlFlag`: Requires rdt=true to be present in the URL search to open the Remix Development Tools. Defaults to `false`. 
- `plugins`: Allows you to provide additional tabs (plugins) to the Remix Development Tools. Defaults to `[]`.
 

## Plugins

Writing plugins for Remix Development Tools is easy. You can write a plugin that adds a new tab to the Remix Development Tools in the following way:
1. Create a new file in your project called `remix-dev-tools-plugin.tsx`
2. Implement your jsx component and add the logic you wish to add to the Remix Development Tools.
3. Export a function with the following contract:
  
```jsx

  const MyComponent = () => {
    // Implement your logic here
    return <div>My Component</div>
  }

  export function remixDevToolsPlugin(yourOptions?: { ... }): JSX.Element {
    return {
      // can't be page, terminal or routes, must be unique
      id: "my-plugin",
      // Name that is shown in the tab next to the icon
      name: "My Plugin",
      // Icon to be shown in the tab
      icon: <MyIcon size={16} />,
      // The component to be rendered when the tab is active
      component: <MyComponent />,
      // Whether the tab requires the Remix Forge VS Code extension to be connected to be shown
      requiresForge: false,
      // Whether the timeline should be shown on the tab
      hideTimeline: false,
    }
  }
  ```
4. Import it in your `root.tsx` file and pass it to your Remix Development Tools:
```diff
import { remixDevToolsPlugin } from "./remix-dev-tools-plugin";

-  <RemixDevTools />
+  <RemixDevTools plugins={[remixDevToolsPlugin()]} />
 
```
5. You should now see your plugin in the Remix Development Tools as a new tab.


### Using Remix Forge with your plugin

If you want to use Remix Forge with your plugin you can do so by setting the `requiresForge` property to `true` in your plugin. This will make sure that the plugin is only shown when the Remix Forge VS Code extension is connected. 

1. Follow the above guide to create a plugin.
2. Import the following hook from remix-development-tools:

```jsx 
import { useRemixForgeSocket } from "remix-development-tools"; 
```

3. Use the hook in your plugin to get the Remix Forge socket:
```jsx
  const MyComponent = () => {
    const socket = useRemixForgeSocket();
    // Implement your logic here
    return <div>My Component</div>
  }
```
4. You can now use the socket to send messages to the Remix Forge VS Code extension. For now it accepts reading/deleting/opening files in VS Code

```jsx
  const MyComponent = () => {
    const socket = useRemixForgeSocket();
    const runCommand = () => {
      socket.sendJsonMessage({ subtype: "read_file", path: "package.json" })
    }
    // Implement your logic here
    return <div onClick={runCommand}>My Component</div>
  }
```

5. The following contract is returned from the extension:

```ts
  interface RemixForgeResponse {
    type: "plugin";
    subtype: "read_file" | "open_file" | "delete_file" | "write_file";
    error: boolean;
    data: string | null;
  }
```
6. Make sure you check if the type and subtype match your needs before using the data.
7. Refer to `react-use-websocket` for more information on how to use the socket and what options it accepts because that is what is used under the hood.
8. After you're done share your plugin with the community by opening a discussion!


## v1 -> v2 migration guide
The migration should be really simple. These are the following things you need to do:
1. Remove the old imports of the stylesheet and addition of the stylesheets to your links export. This is bundled now within the Remix Development Tools.
```diff
- import rdtStylesheet from "remix-development-tools/stylesheet.css";
export const links = [
  // ... other links
-  { rel: "stylesheet", href: rdtStylesheet },
]

```

2. If you were using `initRouteBoundariesClient` and `initRouteBoundariesServer` you just need to replace them with the new `initClient` and `initServer` functions. You can skip the rest of the steps, you're ready to go!
3. Add the `initClient` function to your `entry.client.tsx` file. This is needed to initialize the route boundaries functionality and possible future functionality. (Refer to getting started steps above on how to do that)
4. Add the `initServer` function to your `entry.server.tsx` file. This is needed to initialize the route boundaries functionality (and not cause hydration issues) and possible future functionality. (Refer to getting started steps above on how to do that)
5. You are good to go!
## Troubleshooting

### Hydration issues and Remix Development tools crashing with i18n

Make sure you're passing the same context to the `i18n.getRouteNamespaces()` function as you're passing to the `<RemixServer>` component. 

```diff
+  const context =
+    process.env.NODE_ENV === "development"
+      ? await import("remix-development-tools").then(({ initServer }) => initServer(remixContext))
+      : remixContext;
   ...
-  let ns = i18n.getRouteNamespaces(remixContext);
+  let ns = i18n.getRouteNamespaces(context);
   ...
   <I18nextProvider i18n={instance}> 
+    <RemixServer abortDelay={ABORT_DELAY} context={context} url={request.url} />
   </I18nextProvider>
```
### HMR is failing with RDT

Wrap the `RemixDevTools` component in a `Suspense` component.

```diff
export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
+       {RemixDevTools && <Suspense><RemixDevTools /></Suspense>}
      </body>
    </html>
  );
}
```

## Contributing

Contributions to Remix Development Tools are welcome! To contribute, please follow these guidelines:

1. Fork the repository and clone it locally.
2. Create a new branch for your feature or bug fix. 
4. Run `npm run dev` to start the development server with a vanilla Remix app setup.
4. Run `npm run epic-dev` to start the development server with the epic stack.
5. Implement your changes, adhering to the existing code style and best practices.
5. Please add tests for any new features or bug fixes.
6. Commit and push your changes to your forked repository.
7. Open a pull request, providing a clear description of your changes and their purpose.

### Contributing on Remix Forge integrations

If you want to contribute to the VS Code extension integration follow the steps above and then:
1. Clone the repo for Remix Forge locally.
2. Open it in VS Code.
3. Run `npm install`
4. Run `npm run dev`
5. Click `F5` which will launch a debugger instance of VS Code.
6. In the debugger instance of VS Code, start the remix dev tools
7. Click `Connect to Remix Forge` in the Remix Dev Tools
8. Code on!

## Support

If you like Remix Development Tools consider starring the repository. If you have any questions, comments, or suggestions, please feel free to reach out!

## License

Remix Development Tools is open-source software released under the [MIT License](https://opensource.org/licenses/MIT).

## Acknowledgments

Remix Development Tools was inspired by the Remix framework and aims to enhance the development experience for Remix users.

Feel free to explore Remix Development Tools, and we hope it significantly improves your Remix development process. If you encounter any issues or have suggestions for enhancements, please don't hesitate to open an issue on our GitHub repository. Happy Remixing!

## Thanks

Thanks to all the contributors on this project and the support to the community. You guys are awesome!

---

Devoted to my loving wife.

In loving memory of my late Grandfather, who taught me to always be curious, never stop learning, and to always be kind to others. I miss you, Grandpa.
