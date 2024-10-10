<p align="center">
<img src="./assets/remix-dev-tools.png" style="display: block; margin: 0 auto;" align="middle" height="240" alt="Remix Development Tools"  />
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


# Deprecation warning!

Huge news! The remix-development-tools will be turning into react-router-devtools once the stable release of react-router 7 is out! As you already might've heard remix is being merged into react-router, so naturally these devtools are going to be supporting react-router users rather than remix users!

We are looking forward to expanding the scope of our users to a much broader audience and helping even more projects. When it comes to remix-development-tools all the updates will be coming out regularly until the official release of react-router v7 where this package will be rebranded with the same feature set.

## Getting Started

1. Install the package via npm:

```bash
npm install remix-development-tools -D
```

```js
import { remixDevTools } from "remix-development-tools";

// Add it to your plugins array in vite.config.js
export default defineConfig({
  plugins: [remixDevTools(), remix(), tsconfigPaths()],
});
```

That's it, you're done!


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

Devoted to my loving wife and my little late bird Kiira who helped me initially build out these tools by keeping me company and being my rubber duck, she will forever be my best friend.

In loving memory of my late Grandfather, who taught me to always be curious, never stop learning, and to always be kind to others, and my late Grandmother who always encouraged me to learn new things, and stand up for the things I believe in.
