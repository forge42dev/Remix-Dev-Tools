# Remix Development Tools

![GitHub Repo stars](https://img.shields.io/github/stars/Code-Forge-Net/Remix-Dev-Tools?style=social)
![npm](https://img.shields.io/npm/v/remix-development-tools?style=plastic)
![GitHub](https://img.shields.io/github/license/Code-Forge-Net/Remix-Dev-Tools?style=plastic)
![npm](https://img.shields.io/npm/dy/remix-development-tools?style=plastic) 
![GitHub top language](https://img.shields.io/github/languages/top/Code-Forge-Net/Remix-Dev-Tools?style=plastic) 

Remix Development Tools is an open-source package designed to enhance your development workflow when working with Remix, a full-stack JavaScript framework for building web applications. This package provides a user-friendly interface consisting of two tabs, **Active Page** and **Routes**, along with a side tab called **Timeline**. With Remix Development Tools, you can efficiently monitor and manage various aspects of your Remix projects, including page information, URL parameters, server responses, loader data, routes, and more.

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

## Getting Started

To install and utilize Remix Development Tools, follow these steps:

1. Install the package via npm:

```bash
npm install remix-development-tools -D
```

2. Add the following to your application `root.tsx` file:

```diff
// We'll lazy load RemixDevTools to ensure it doesn't contribute to production bundle size
+ import { lazy } from "react";
+ import rdtStylesheet from "remix-development-tools/stylesheet.css";
+ const RemixDevTools =
+  process.env.NODE_ENV === "development"
+    ? React.lazy(() => import("remix-development-tools"))
+    : undefined;

+ export const links: LinksFunction = () => [
+   ...(rdtStylesheet && process.env.NODE_ENV === "development" ? [{ rel: "stylesheet", href: rdtStylesheet }] : []),
+ ];


...

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
+       {RemixDevTools && <RemixDevTools />}
      </body>
    </html>
  );
}
```

## RemixDevTools props

The `RemixDevTools` component accepts the following props:

- `port`: The port number to use for the Remix Development Tools connection to Remix Forge. If you want to change the port and connect to your Remix Forge VS code extension you need to change the port in VS Code too. Defaults to `3003`.
- `defaultOpen`: Whether to open the Remix Development Tools by default. Defaults to `false`.
- `position`: The position of the Remix Development Tools trigger. Defaults to `bottom-right`.
- `requireUrlFlag`: Requires rdt=true to be present in the URL search to open the Remix Development Tools. Defaults to `false`.
- `showRouteBoundaries`: Allows you to see each Outlet and route boundaries by coloring the background. Defaults to `false`.

## Contributing

Contributions to Remix Development Tools are welcome! To contribute, please follow these guidelines:

1. Fork the repository and clone it locally.
2. Create a new branch for your feature or bug fix.
3. Run `npm run setup` to get your development environment set up.
4. Run `npm run dev` to start the development server.
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