# Remix Website

## Setup

First setup your `.env` file, use `.env.example` to know what to set.

```sh
cp .env.example .env
```

Install dependencies

```sh
npm i
```

## Local Development

Now you should be good to go:

```sh
npm run dev
```

To preview local changes to the `docs` folder in the Remix repo, select "local" from the version dropdown menu on the site. Make sure you have the [remix repo](https://github.com/remix-run/remix) cloned locally and `LOCAL_REPO_RELATIVE_PATH` is pointed to the correct filepath.

We leverage a number of LRUCache's to server-side cache various resources, such as processed markdown from GitHub, that expire at various times (usually after 5 minutes). If you want them to expire immediately for local development, set the `NO_CACHE` environment variable.

```sh
NO_CACHE=1 npm run dev
```

Note that by default this assumes the relative path to your local copy of the Remix docs is `../remix/docs`. This can be configured via `LOCAL_REPO_RELATIVE_PATH` in your `.env` file.

## Preview

To preview the production build locally:

```sh
npm run build
npm run preview
```

## Deployment

The production server is always in sync with `main`

```sh
git push origin main
open https://remix.run
```

Pushing the "stage" tag will deploy to [staging](https://remixdotrunstage.fly.dev/blog).

```sh
git checkout my/branch

# moves the `stage` tag and pushes it, triggering a deploy
npm run push:stage
```

When you're happy with it, merge your branch into `main` and push.

## Content

### Authoring Blog Articles

- Put a markdown file in `data/posts/{your-post-slug}.md`
- Follow the conventions found in other blog articles for author/meta
  - Make sure your author name in the post is the same as the one in `data/authors.yml`
  - If you don't have an author photo yet, create one ([the template is in Figma](https://www.figma.com/file/6G68ZVNbR6bMHl2p8727xi/www.remix.run?node-id=6%3A2))
- Create and optimize any inline blog post image(s) and put them in `/public/blog-images/posts/{your-post-slug}/{image-name}.{format}`
  - @TODO convention for ensuring images are large enough for 1x/2x?
- Create a featured image for the post that shows up on the blog’s index page as well as at the top of each post. Put it in `/public/blog-images/headers/{your-post-slug}.{format}` (this gets referenced in the YAML front-matter for each post).
  - @TODO what is, or should be, the difference between this image and the social share image?

When linking to other posts use `[name](article-slug)`, you don't need to do `[name](/blog/article-slug)`

### Adding to Showcase

[The Showcase](https://remix.run/showcase) page is a collection of sites built on Remix that are particularly impressive. If you think there is something missing from this list, feel free to open a PR for the team to review.

- Record quick demo of the website (~6s)
- Grab or screenshot the first frame of the video
- Add both resources to public/showcase-assets
- Run `cd public/showcase-assets && ./convert.sh` to convert images and videos to compressed formats
  - Warning: this script was created hastily with ChatGPT and little concern for others running it. Feel free to offer improvements to the script and/or documentation
- Remove/don't commit the original video and image
- Add new showcase example data to [showcase.yaml](./data/showcase.yaml)

### Adding to Resources

[The Resources](https://remix.run/resources) page is a collection of templates and libraries that make building sites with Remix even easier. For now this data is driven by a yaml file, but eventually we anticipate replacing it with a database.

If you would like to contribute a new resource to these pages, simply add it to [resources.yaml](./data/resources.yaml)

## CSS Notes

You'll want the [tailwind VSCode plugin](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) fer sure, the hints are amazing.

The color scheme has various shades but we also have a special "brand" rule for each of our brand colors so we don't have to know the specific number of that color like this: `<div className="text-pink-brand" />`.

We want to use Tailwind's default classes as much as possible to avoid a large CSS file. A few things you can do to keep the styles shared:

- Avoid changing anything but the theme in `tailwind.config.js`, no special classes, etc.
- Avoid "inline rules" like `color-[#ccc]` as much as possible.
- Silly HTML (like a wrapper div to add padding on a container) is better than one-off css rules.

## Algolia Search

We use [DocSearch](https://docsearch.algolia.com/) by Algolia for our documentation's search. The site is automatically scraped and indexed weekly by the [Algolia Crawler](https://crawler.algolia.com/).

If the doc search results ever seem outdated or incorrect be sure to check that the crawler isn't blocked. If it is, it might just need to be canceled and restarted to kick things off again. There is also an editor in the Crawler admin that lets you adjust the crawler's script if needed.
