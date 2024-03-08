---
title: Remix Stacks
summary: Introducing the easiest way to create a ready-to-deploy, production grade, fast web application with Remix.
date: 2022-03-17
featured: true
image: /blog-images/headers/remix-stacks.jpg
imageAlt: "Stack of pancakes with cream and strawberries"
authors:
  - Kent C. Dodds
---

When you're building a web application, in addition to the web framework you're using and all the tooling associated with that (which Remix is happy to provide), you typically need a CI/CD pipeline, a database, and a hosting platform. Lots of our early adopters are frontend developers who aren't accustomed to deploying app and database servers. And frankly even folks who are accustomed to it often don't enjoy the process of getting things set up.

When lightning has struck 🌩 and you're ready to start coding your new mind blowing idea 🤯, the last thing you want is the tedious process of setup to get in between your inspiration and deploying your app. And when that idea turns out to be a great one, nobody wants to deploy that rushed setup to production.

That's why we're excited to announce the release of **Remix Stacks**: the easiest way to get your Remix application started and ready to deploy! 🥞

[![Introducing stacks video](/blog-images/posts/stacks-intro-video.png)](https://www.youtube.com/watch?v=mHmgTPjGyc0&list=PLXoynULbYuEC8-gJCqyXo94RufAvSA6R3)

Stacks is really two features:

1. Pre-built production ready templates from the Remix team
2. The ability to create custom templates for you and your company

## Built-in stacks

In just a few minutes, we can get your app off the ground and ready to deploy all wired up with a CI/CD pipeline, connected database with a basic data model (via [prisma](https://prisma.io)), and even user authentication! It also has tools setup for development like [Tailwind](https://tailwindcss.com), [TypeScript](https://typescriptlang.org), [Prettier](https://prettier.io), [ESLint](https://eslint.org), [Cypress](https://cypress.io), [MSW](https://mswjs.io), [Docker](https://www.docker.com/), [vitest](https://vitest.dev), [Testing Library](https://testing-library.com), and more!

With this release, we're excited to give you three stacks, with more on the way:

- [The Blues Stack](https://github.com/remix-run/blues-stack): Deployed to the edge (distributed) with a long-running Node.js server and PostgreSQL database. Intended for large and fast production-grade applications serving millions of users.
- [The Indie Stack](https://github.com/remix-run/indie-stack): Deployed to a long-running Node.js server with a persistent SQLite database. Intended to get you going quickly with little complexity for prototypes and proof of concepts that can be later updated to the Blues stack without much trouble.
- [The Grunge Stack](https://github.com/remix-run/grunge-stack): Deployed to a serverless function running Node.js with DynamoDB for persistance. Intended for folks who want to deploy a production-grade application on AWS infrastructure serving millions of users.

[![Desktop showing three websites](/blog-images/posts/stacks.png)](https://github.com/topics/remix-stack)

Watch me speed-run through [deploying the Indie Stack to production in less that 2 minutes](https://youtu.be/VBvEAhDMJXc?list=PLXoynULbYuEC8-gJCqyXo94RufAvSA6R3):

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/VBvEAhDMJXc?rel=0&list=PLXoynULbYuEC8-gJCqyXo94RufAvSA6R3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Or, watch the same thing, except [deploying the Grunge Stack to AWS](https://youtu.be/J9sHle5Q8ME?list=PLXoynULbYuEC8-gJCqyXo94RufAvSA6R3)

Yes, they're named after music genres 🎶🎸🎷🥁

For all of these stacks, all you do is run the normal `npx create-remix@latest` and choose them from the CLI. This will generate your project for you and then just pop open the `README.md` to get things running! In all cases, you get a full app that's ready to develop locally and deploy to production with automated GitHub actions. It even supports a staging environment for your `dev` branch!

We even have all layers of the testing trophy setup for you! With TypeScript/Prettier/ESLint handling the static portion of testing, Vitest handling the unit bit, and Cypress/Testing Library/MSW handling the integration/E2E bit! In fact, we even have a custom `cy.login()` command that allows you to hit the ground running with tests requiring authentication. And there's already a test in place for testing user registration and authentication. Get started on the right foot and code your ideas with confidence!

## Custom Stacks

We know that many of you at larger companies already have deployment environments and preferred databases. You have your own prettier and ESLint configs too. So we've built this feature in such a way that you can create your own stacks. Fork ours or create them from scratch. Then you can [use the `--template` flag](https://remix.run/docs/en/v1/pages/stacks#--template) of the Remix CLI to generate a Remix project based on your own template! It even works from private GitHub repos, URLs to tarballs, and more. And we've got an ability for you to [customize the initialization](https://remix.run/docs/en/v1/pages/stacks#customize-initialization) and [auto-remove TypeScript](https://remix.run/docs/en/v1/pages/stacks#remove-typescript) for folks who don't want the extra help.

We fully expect the custom stacks to get a LOT of use. We think most people will use custom stacks than the ones we build for you. Feel free to fork and modify whatever you like. Read more about creating custom stacks from the [Remix Stacks documentation](/pages/stacks). Check out how quickly you can create a custom stack in [Make your own Remix Stack](https://youtu.be/iAY9MWUF91c?list=PLXoynULbYuEC8-gJCqyXo94RufAvSA6R3):

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/iAY9MWUF91c?rel=0&list=PLXoynULbYuEC8-gJCqyXo94RufAvSA6R3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Let your imagination run wild with this. We think it's going to be a big hit. Here are some ideas of things you could use the `--template` flag for:

- Local directory when developing your own stack.
- GitHub repo when sharing your open source stack with the world.
- Tarball URL when publishing your stack to S3 for others to use in your company.
- Starter for building a content platform with your headless CMS and Remix.
- Private GitHub repo for getting a Remix app started with your company's component library and deployed on your company's infrastructure.

So much possibility here to help engineers hit the ground running to solve their own problems.

## Try Stacks!

At Remix, we're fiercely committed to improving the user experience (UX) of your web application. Because developer experience (DX) and your productivity are an important input into that UX, we're working hard to make that excellent. And we're definitely not finished.

```
npx create-remix@latest
```
