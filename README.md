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

# Documentation 

Detailed documentation can be found here:

https://remix-development-tools.fly.dev/


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
 

## Troubleshooting
  

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
