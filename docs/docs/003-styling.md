# Customise the look of your docs 💅

Extending your styles (or changing it entirely) is pretty easy, the entire docs app is divided into five routes:

- `_index.tsx`: The index route, this is the landing page of your docs. If you want to abolish a landing page, feel free to uncomment the `redirect` function in the loader.
- `docs.$tag.tsx`: The docs 'tag' route, this is where the heavy lifting happens for versioning. Versioning would be discussed later. It also contains the sidebar wrapper for your app (as you would see, the app is wrapped in a `Sidebar` component that provides quite a lot of information).
- `docs.$tag.$slug.tsx`: The docs 'slug' route, this is where the actual docs content is rendered.
- `docs.$tag._index.tsx`: The docs 'tag index' route, this is where the 'index' route is rendered, if any (this would be explained later in the writing-docs section).
- `updateTheme.tsx`: Handles themes more or less. Journal Stack includes support for system, light and dark themes (Thanks Daniel Kaneem for the concept!)

That's basically it! There are three main components that make up the docs itself:

- `app/components/layout/Header.tsx`: The header of the doc, both mobile and desktop-wise.
- `app/components/layout/Sidebar.tsx`: The sidebar of the docs, handles the heavy weighlifting of all the docs manipulation and versioning
- `app/components/layout/Documentation.tsx`: The content of the docs, handles the rendering of the docs content itself.
