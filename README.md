<p align="center">
<img src="./assets/remix-dev-tools.png" style="display: block; margin: 0 auto;" align="middle" width="240" height="240" alt="Remix Development Tools"  />
</p>

# Remix Development Tools

![GitHub Repo stars](https://img.shields.io/github/stars/Code-Forge-Net/Remix-Dev-Tools?style=social)
![npm](https://img.shields.io/npm/v/remix-development-tools?style=plastic)
![GitHub](https://img.shields.io/github/license/Code-Forge-Net/Remix-Dev-Tools?style=plastic)
![npm](https://img.shields.io/npm/dy/remix-development-tools?style=plastic) 
![npm](https://img.shields.io/npm/dw/remix-development-tools?style=plastic) 
![GitHub top language](https://img.shields.io/github/languages/top/Code-Forge-Net/Remix-Dev-Tools?style=plastic) 

Remix Development Tools is an open-source package designed to enhance your development workflow when working with Remix, a full-stack JavaScript framework for building web applications. This package provides a user-friendly interface consisting of three tabs, **Active Page**, **Terminal**, **Settings**, **Errors** and **Routes**, along with a side tab called **Timeline**. With Remix Development Tools, you can efficiently monitor and manage various aspects of your Remix projects, including page information, URL parameters, server responses, loader data, routes, and more. You can
also track down hydration issues with the **Errors** tab and view your routes in a tree/list view with the **Routes** tab.

## Getting Started

1. Install the package via npm:

```bash
npm install remix-development-tools -D
```

### Vite plugin

```js
import { remixDevTools } from "remix-development-tools/vite";

// Add it to your plugins array in vite.config.js
export default defineConfig({
  plugins: [remixDevTools(), remix(), tsconfigPaths()], 
});
```

That's it, you're done!

### Remix bundler

Make sure that everything is guarded by the NODE_ENV check so it doesn't break your production build if you installed it as a dev dependency!

To install and utilize Remix Development Tools, follow these steps:

 

1. Add the following to your application `root.tsx` file:

```diff
// Import styles
+ import rdtStylesheet from "remix-development-tools/index.css"; 
+ export const links: LinksFunction = () => [
    // export the stylesheet in development only
+   ...(process.env.NODE_ENV === "development" ? [{ rel: "stylesheet", href: rdtStylesheet }] : []),
+ ] 
 
+ let AppExport = App;
// This imports the dev tools only if you're in development
+ if(process.env.NODE_ENV === 'development') { 
+   const { withDevTools } = await import("remix-development-tools"); 
+   AppExport = withDevTools(AppExport);
+ }

+ export default AppExport;

``` 
If you're using CJS instead of ESM you can do the following instead:
```diff
 
if(process.env.NODE_ENV === 'development') { 
- const { withDevTools } = await import("remix-development-tools"); 
+ const { withDevTools } = require("remix-development-tools"); 
  AppExport = withDevTools(AppExport);
}
export default AppExport;

``` 

You're good to go! 

If you want to add the server side logs and listeners you need to do one of the following:

### Custom server setup

Make sure that everything is guarded by the NODE_ENV check so it doesn't break your production build if you installed it as a dev dependency!

If you're running a custom server this is what you need to do:
1. Wrap your build in your server file with `withServerDevTools` function. This takes an optional second parameter that allows you to configure it.
2. Wrap your re-imported build too if you are in manual mode.
3. You're done! Here is the example code:

```ts 
  // Somewhere in your server.ts file
  const build = await import(BUILD_PATH)
  let devBuild = build
  let devToolsConfig  = null;
  // Make sure you guard this with NODE_ENV check
  if(process.env.NODE_ENV === 'development') {
    const { withServerDevTools, defineServerConfig } = await import("remix-development-tools/server"); 
     // Allows you to define the configuration for the dev tools
      devToolsConfig = defineServerConfig({ 
      //... your config here ...
    })
    // wrap the build with the dev tools
    devBuild = withServerDevTools(build, devToolsConfig)
  }
// Make sure you guard this with NODE_ENV check
if(process.env.NODE_ENV === "development"){
  // .... somewhere later in your code ...
  // This makes sure the build is wrapped on reload, you will need this if you're running with the --manual flag
  async function reloadBuild() {
    devBuild = await import(`${BUILD_PATH}?update=${Date.now()}`)
    // wrap the build with dev tools on re-import
    devBuild = withServerDevTools(devBuild, devToolsConfig)
    broadcastDevReady(devBuild)
  }
}
```
If you're using a CJS custom server you can replace the following lines:
```diff
- const { withServerDevTools, defineServerConfig } = await import("remix-development-tools/server"); 
+ const { withServerDevTools, defineServerConfig } = require("remix-development-tools/server"); 
```

### CJS remix server setup (remix run server started by remix dev)

> [!NOTE]  
> This is only needed when you're not running a custom server and you're using the remix dev server


Just add the following command to your package.json:
```diff
- "dev": "remix dev",
+ "dev": "remix dev -c \"rdt-cjs-serve ./build/index.js\" --manual",
```

### ESM remix server setup (remix run server started by remix dev)

> [!NOTE]  
> This is only needed when you're not running a custom server and you're using the remix dev server

Just add the following command to your package.json:
```diff
- "dev": "remix dev",
+ "dev": "remix dev -c \"rdt-serve ./build/index.js\" --manual",
```

## How it looks
### Server logger
![server logger](./assets/logs.png) 
### Routes Tab  
![routes](./assets/routes-tab.png)
### Errors Tab
![errors](./assets/error-tab.png)
### Timeline
![timeline](./assets/timeline.gif)
### Active Page
![active page](./assets/active-tab.png)


## What's new?

## v3.7.0

- Hydration mismatch detector! You can now see which elements are mismatched on the client and server. This can help you debug hydration issues a lot faster!

## v3.5.0
- Vite plugin for Remix Vite support!
- You can now ALT + A to open up dev tools as a shortcut
- Reorganization of server information in the active page tab
- Server information now shows you more information like request/response headers and request body

## v3.3.0
- HMR speed-up > HMR is now a lot faster due to the fact the package doesn't use lucide-react which was slowing down HMR on certain machines
- Errors tab > you can now see the HTML nesting errors that you might have on your page and open the files directly in VS code. This 
can help you debug hydration issues a lot faster!

## v3.2.1

- View-source > you can CTRL + right-click any element in the browser to open it up in your VS code. This requires you to have VS code "code" executable set in your PATH which is an optional checkbox durring the installation process or you can add it yourself manually as a PATH variable
- Open in VS code button on routes > you can open up route segments directly in vscode, the same is needed as above

## v3.1.0

- Cache information on the client side -> shows you how long and where each loader is cached for
- Server execution timings => shows you all execution timings, average, minimum and maximum execution time for each loader/action
- Server headers => shows you all headers that are sent from the server via actions/loaders
- List of all loaders/actions that are executed on the server and their responses
- UI active page tab revamp and improvements

## v3.0.0
Remix Development Tools v3.0.0 is here! This release brings a lot of new features and improvements to the Remix Development Tools. The most notable ones are:
1. The setup is completely changed (Check the getting started section for more info) 
2. The new dev tools are now a lot more stable and reliable. We have fixed a lot of bugs and improved the overall stability of the dev tools.
3. New server logger and server side listeners.
4. New rdt dev server
## v2.4.0
- Route boundaries locked behind a feature flag
- Panel position settings allow you to change the panel position to either top or bottom of the screen
- ErrorBoundaries are more precise now
## v2.3.0 
Route tree view support!
View all your routes in a node tree! You can also open routes in your browser from the tree view.
## v2.2.0
Embedded mode support!
Embed your dev tools wherever you want in your app by importing EmbeddedDevTools from the package!
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

# Features

## Server

Here are features offered on the server side of Remix Development Tools:
- Loader logs -> logs loader triggers and execution timing (from the moment the loader is triggered to the moment it finishes)
- Action logs -> logs action triggers and execution timing (from the moment the action is triggered to the moment it finishes)
- Cache logs -> logs your caching strategies that you define in your loaders/actions
- Cookie logs -> logs when you set cookies in your loaders/actions
- Defer support -> tells you which keys are deferred and how long it took for them to resolve
- Server side listeners -> listens to certain events and sends them to the client side for display

More features are coming soon!

## Client

### View source

ALT + Right-click any element in the browser to open it directly in your vscode instance!

### Active Page Tab

The **Active Page** tab in Remix Development Tools allows you to gain insights into the current page you are working on. It provides valuable information and data that can assist you in debugging and understanding the behavior of your application. 

Key features include:

- **URL Parameters**: Easily view and analyze the URL parameters associated with the current page.
- **Server Responses**: Inspect and review the server responses received by the application for the current page.
- **Loader Data**: Monitor and track the loader data used by the application during page rendering.
- **Route boundaries** See each Outlet and route boundaries by coloring the background. 
- **Server info** - See each loader min/max/avg execution time, cache info, headers info and more!
- **Open in VS Code** - Open up any route segment in VS Code directly from the dev tools!

### Routes Tab

Allows you to view your routes in either a tree/list view! You can also open routes in your browser from the tree view.

The **Routes** tab enables you to manage and explore the routes within your Remix project. This tab offers an intuitive interface to perform the following tasks:

- **Route Overview**: View an organized list of all the routes available in your project.
- **Wildcard Values**: Add and manage wildcard values for dynamic routing.
- **Browser Integration**: Open routes directly in your preferred web browser for quick testing and verification.
- **VS Code Integration**: Seamlessly connect to the Remix Forge VS Code extension and leverage its capabilities to open routes within your VS Code environment and easily add new routes.

### Timeline Tab

The **Timeline** side tab provides a timeline view of events occurring during the development process. This tab helps you track the sequence of actions and events, providing valuable insights into the execution flow of your application.

### Errors Tab

The **Errors** tab allows you to track down hydration issues in your application. It shows you the HTML nesting errors that you might have on your page and allows you to open the files directly in VS code. This can help you debug hydration issues a lot faster!

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

### Embedded mode

Embedded mode allows you to embed the Remix Dev Tools in your application. This is useful if you want to have the dev tools open in a particular
page in your application only or you want to place it somewhere in the UI where it makes sense for your application.

## Server dev tools configuration

### Vite server dev tools

The vite plugin takes in the following config:

```ts
  interface Config { 
    // allows you to not log anything to the console
    silent?: boolean;
    logs?: {
      // allows you to not log cookie logs to the console
      cookies?: boolean;
      // allows you to not log defer logs to the console
      defer?: boolean;
      // allows you to not log action logs to the console
      actions?: boolean;
      // allows you to not log loader logs to the console
      loaders?: boolean;
      // allows you to not log cache logs to the console
      cache?: boolean;
      // allows you to not log when cache is cleared to the console
      siteClear?: boolean;
    };
  }
```

It can be passed in the following way:
  
```ts

import { remixDevTools } from "remix-development-tools/vite";
export default defineConfig({
  plugins: [
    remixDevTools({
      server: {
        ... your config here ...
      }
  })], 
});
```

### Remix bundler server dev tools

Here are the server config options:
  
  ```ts
    interface Config {
      // Sets the ws port for the dev tools to communicate with the client dev tools
      wsPort?: number;
      // allows you to not communicate at all with the client dev tools
      withWebsocket?: boolean;
      // allows you to not log anything to the console
      silent?: boolean;
      logs?: {
        // allows you to not log cookie logs to the console
        cookies?: boolean;
        // allows you to not log defer logs to the console
        defer?: boolean;
        // allows you to not log action logs to the console
        actions?: boolean;
        // allows you to not log loader logs to the console
        loaders?: boolean;
        // allows you to not log cache logs to the console
        cache?: boolean;
        // allows you to not log when cache is cleared to the console
        siteClear?: boolean;
      };
    }
  ```
you can use the `defineServerConfig` function to define the config with a fully typed object! This is useful if you want to use the config in multiple places. 

```ts
import { defineServerConfig, withServerDevTools } from 'remix-development-tools/server'

const config = defineServerConfig({
  // ... your config here ...
})

const build = withServerDevTools(await import(BUILD_PATH), config)

```

## RemixDevTools props

The `RemixDevTools` component accepts the following props:  
- `plugins`: Allows you to provide additional tabs (plugins) to the Remix Development Tools. Defaults to `[]`. 

### Defining the config

You can import `defineClientConfig` to define the config with a fully typed object! This is useful if you want to use the config in multiple places. 

```ts
import { defineClientConfig } from 'remix-development-tools'

const config = defineClientConfig({
  // ... your config here ...
})

export default withDevTools(App, config)
```
 

## Plugins

### Plugins in Vite


Plugins work in a different way in Vite. You create a directory for plugins and just provide the path to the directory to the plugin. The plugin will automatically import all the plugins from the directory and add them to the dev tools. You only need to make sure your exports are named exports and not default exports and that they are uniquely named.
  
You can create a directory called `plugins` in your project and add your plugins there. Then you can add the following to your vite.config.js file:
```ts

import { remixDevTools } from "remix-development-tools/vite";
export default defineConfig({
  plugins: [
    remixDevTools({
      pluginsDir: "./plugins"
  })], 
});
```

### Plugins in Remix bundler

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

-  withDevTools(App);
+  withDevTools(App, { plugins: [remixDevToolsPlugin()] })
 
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

## v2 -> v3 migration guide

The migration should be really simple. These are the following things you need to do:
1. Remove everything from `entry.client.tsx` and `entry.server.tsx` files.
2. In your root import the stylesheet and the withDevTools function from the package.
```diff
+ import rdtStylesheet from "remix-development-tools/index.css";
+ import { withDevTools } from "remix-development-tools";
```
3. Wrap your app with the withDevTools function.
```diff
- export default App;
+ export default withDevTools(App);
```
4. You're good to go! (You can also add the server logger on top of that if you want)


## Troubleshooting

### Cloudflare

I am aware of the fact that Remix Development Tools doesn't work with Cloudflare. I am working on a fix for this issue.

### Types missing from "remix-dev-tools/server" import

If your `moduleResolution` is set to `Node` in your `tsconfig.json` file you may encounter missing types when importing from `remix-dev-tools/server`. To fix this issue you need to add the following to your `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "moduleResolution": "Bundler"
  }
}
```

### [ lower version than V3 only ] Dynamic imports are only supported when the "--module" flag is set to 'es2020', 'es2022', 'esnext', 'commonjs', 'amd', 'system', 'umd', 'node16', or 'nodenext'.ts(1323)

To fix this issue you need to add the following to your `tsconfig.json` file:

```json
{
  "compilerOptions": {
    // Or whatever module you are using
    "module": "commonjs"
  }
}
```
### [ lower version than V3 only ] Hydration issues and Remix Development tools crashing with i18n

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
### [ lower version than V3 only ] HMR is failing with RDT

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
