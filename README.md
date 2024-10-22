<p align="center">
<img src="./assets/react-router-dev-tools.png" style="display: block; margin: 0 auto;" align="middle" height="240" alt="Remix Development Tools"  />
</p>

# Remix Development Tools

![GitHub Repo stars](https://img.shields.io/github/stars/forge42dev/react-router-devtools?style=social)
![npm](https://img.shields.io/npm/v/react-router-devtools?style=plastic)
![GitHub](https://img.shields.io/github/license/forge42dev/react-router-devtools?style=plastic)
![npm](https://img.shields.io/npm/dy/react-router-devtools?style=plastic)
![npm](https://img.shields.io/npm/dw/react-router-devtools?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/forge42dev/react-router-devtools?style=plastic)

Remix Development Tools is an open-source package designed to enhance your development workflow when working with Remix, a full-stack JavaScript framework for building web applications. This package provides a user-friendly interface consisting of three tabs, **Active Page**, **Terminal**, **Settings**, **Errors** and **Routes**, along with a side tab called **Timeline**. With Remix Development Tools, you can efficiently monitor and manage various aspects of your Remix projects, including page information, URL parameters, server responses, loader data, routes, and more. You can
also track down hydration issues with the **Errors** tab and view your routes in a tree/list view with the **Routes** tab.

# Documentation

Detailed documentation can be found here:

https://remix-development-tools.fly.dev/


## Getting Started

1. Install the package via npm:

```bash
npm install react-router-devtools -D
```

```js
import { reactRouterDevTools } from "react-router-devtools";

// Add it to your plugins array in vite.config.js
export default defineConfig({
  plugins: [reactRouterDevTools(), reactRouter(), tsconfigPaths()],
});
```

That's it, you're done!


## Support

If you like Remix Development Tools consider starring the repository. If you have any questions, comments, or suggestions, please feel free to reach out!

## License

Remix Development Tools is open-source software released under the [MIT License](https://opensource.org/licenses/MIT).

## Acknowledgments

React Router Devtools was inspired by the Remix framework / React Router v7 and aims to enhance the development experience for Remix users.

Feel free to explore React Router Devtools, and we hope it significantly improves your Remix development process. If you encounter any issues or have suggestions for enhancements, please don't hesitate to open an issue on our GitHub repository. Happy Remixing!

## Thanks

Thanks to all the contributors on this project and the support to the community. You guys are awesome!

---

Devoted to my loving wife.

In loving memory of my late Grandfather, who taught me to always be curious, never stop learning, and to always be kind to others. I miss you, Grandpa.
