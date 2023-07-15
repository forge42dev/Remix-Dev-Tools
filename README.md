# Remix Development Tools

Remix Development Tools is an open-source package designed to enhance your development workflow when working with Remix, a full-stack JavaScript framework for building web applications. This package provides a user-friendly interface consisting of two tabs, **Active Page** and **Routes**, along with a side tab called **Timeline**. With Remix Development Tools, you can efficiently monitor and manage various aspects of your Remix projects, including page information, URL parameters, server responses, loader data, routes, and more.

## Features

### Active Page Tab

The **Active Page** tab in Remix Development Tools allows you to gain insights into the current page you are working on. It provides valuable information and data that can assist you in debugging and understanding the behavior of your application. Key features include:

- **URL Parameters**: Easily view and analyze the URL parameters associated with the current page.
- **Server Responses**: Inspect and review the server responses received by the application for the current page.
- **Loader Data**: Monitor and track the loader data used by the application during page rendering.

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
npm install remix-devtools --save-dev
``` 
 
2. Add the following to your application `root.tsx` file:

```diff
+ import rdtStylesheet from "remix-dev-tools/public/stylesheet.css";
+ import { RemixDevTools } from "remix-dev-tools";

+ export const links: LinksFunction = () => [
+   ...(rdtStylesheet ? [{ rel: "stylesheet", href: rdtStylesheet }] : []),
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
+       <RemixDevTools />
      </body>
    </html>
  );
}
```

## RemixDevTools props

The `RemixDevTools` component accepts the following props:
- `port`: The port number to use for the Remix Development Tools connection to Remix Forge. If you want to change the port and connect to your Remix Forge VS code extension you need to change the port in VS Code too. Defaults to `3003`.
- `defaultOpen`: Whether to open the Remix Development Tools by default. Defaults to `false`.

## Contributing

Contributions to Remix Development Tools are welcome! To contribute, please follow these guidelines:

1. Fork the repository and clone it locally.
2. Create a new branch for your feature or bug fix.
3. Run `npm run setup` to get your development environment set up.
4. Run `npm run dev` to start the development server.
3. Implement your changes, adhering to the existing code style and best practices. 
5. Commit and push your changes to your forked repository.
6. Open a pull request, providing a clear description of your changes and their purpose.

## Support

If you like Remix Development Tools consider starring the repository. If you have any questions, comments, or suggestions, please feel free to reach out!

## License

Remix Development Tools is open-source software released under the [MIT License](https://opensource.org/licenses/MIT).

## Acknowledgments

Remix Development Tools was inspired by the Remix framework and aims to enhance the development experience for Remix users.

---

Feel free to explore Remix Development Tools, and we hope it significantly improves your Remix development process. If you encounter any issues or have suggestions for enhancements, please don't hesitate to open an issue on our GitHub repository. Happy Remixing!