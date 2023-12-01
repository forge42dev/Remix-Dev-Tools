# Icon library plugin

This plugin allows you to see all tailwind colors in a new tab in remix development tools, copy them and paste into code.

<video controls="controls" src="./color-pallette.mp4" ></video>

## How to use


### Vite
1. Create a plugin directory in your project. (eg on the root you can create a `your-path-here` folder)
2. Copy the code from the plugin located in this folder. and paste it into there (eg `your-path-here/tailwind-pallette.tsx`)
3. Specify the plugin directory in your vite config via the `pluginsDir` option:
  
```js
  // vite.config.js
  export default {
    plugins: [remixDevTools({ pluginsDir: './your-path-here' })]
  }
```


### Remix bundler

1. Copy the code from the plugin located in this folder.
2. Go over the TODO's in the code and modify the code to your project specifications.
3. Import the plugin exported from the `tailwind-pallette.tsx` into your `root.tsx` file.
4. Add the plugin to the `plugins` array in the `withDevTools` wrapper.

```tsx
  import { tailwindPallettePlugin } from "~/tailwind-pallette.tsx";

  AppExport = withDevTools(App, {
    plugins: [tailwindPallettePlugin()]
  });
```

5. Run your project and open the new tab in the development tools.

## How it works

The plugin will use all the tailwind colors and list them for you so you can easily copy paste them and apply them to your elements

You can click on the color to copy the name of the icon to your clipboard.
 

## Can I add my own features?

All the plugins featured under this folder are meant to be copy/pasted into your project with you having all the rights to modify them as you see fit. Feel free to add/remove whatever you like. If you add something cool, please share it with us so we can add it to the list of plugins or improve the existing ones.