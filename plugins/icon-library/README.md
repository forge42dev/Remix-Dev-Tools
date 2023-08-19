# Icon library plugin

This plugin allows you to see all your project icons in a new tab in remix development tools, copy the code and change their classes.

<video controls="controls" src="./Icon library.mp4" ></video>

## How to use

1. Copy the code from the plugin located in this folder.
2. Go over the TODO's in the code and modify the code to your project specifications.
3. Import the plugin exported from the `icon-library.tsx` into your `root.tsx` file.
4. Add the plugin to the `plugins` array in the `RemixDevTools` component.

```tsx
  import { iconLibraryPlugin } from "~/icon-library.tsx";

  <RemixDevTools
    ...
    plugins={[iconLibraryPlugin()]}
  />
```

5. Run your project and open the new tab in the development tools.

## How it works

The plugin will use all the icons in your project that are provided to it and will display them in a grid with different sizes. 

You can click on the icon to copy the code of the icon to your clipboard.

You can use the input on the top right to add custom classes to the component (eg. change colors on the fly).

## How to add icons

This will be easy/hard depending on your project setup. The basic idea is to have an icon component that is reusable across the project by
providing a different name and size to the component. If you do not have this you would probably need to do it in a different way. What is
important is to have an array of icon names in the project that you can use to generate the icons.

## Can I add my own features?

All the plugins featured under this folder are meant to be copy/pasted into your project with you having all the rights to modify them as you see fit. Feel free to add/remove whatever you like. If you add something cool, please share it with us so we can add it to the list of plugins or improve the existing ones.