# Journal Stack

Welcome to Journal Stack! A documentation stack for scaffolding your doc writing experience with multi-version support!

![Journal Stack](https://ucarecdn.com/9a7c0b39-42f7-49f8-bcdf-d308871cdf58/WhatsAppImage20240125at110815PM.jpeg)

## Getting Started

Journal Stack is built around a theme concept: the same documentation but implemented with various themes and repositories. This allows you to choose the theme that best suits your needs as well
as repository (SQL database, CMS, S3 Bucket, etc.) and get started writing documentation right away!

Currently, there is only one theme available:

- **[Remix PWA Theme]()**: This theme is build to replicate [Remix PWA Documentation](https://remix-pwa.run), it also includes the tools used by the docs to store its content. To get started, head over to the [`remix-pwa`]() branch to get started with this theme.

## Documentation

Each theme branch features its own documentation under the `docs` folder. Use this to explore a particular theme and how to expand upon it, I am still in the process of improving the theme and docs overall so feel free to open an issue if you have any questions or suggestions.

## Contributing

Journal Stack is an open source project and contributions are welcome! Check out the [Contributing Guide](./CONTRIBUTING.md) to get started.

A few things I might need help with:

- **Testing**: More test use-cases. Currently, they cover the barest minimum and not enough to test anything realistically. Contributions in this regard would very much be appreciated.
- **Critical Feedback**: Most important one 😄, critical feedback. Could range from code colocation, to my apprach to fetching and caching, to the documentation itself. I'm open to all feedback. Thank you!

### Contributing Opportunities

If you are unsure of where to start, here are a few stuffs that would be nice to have:

- **Improved Typing**: The typing for the app is quite good, however there are a few `any` types sprinkled here and there that could be improved upon.
- **More mock docs**: More docs can't hurt, right? 😄
- **Improved Documentation**: I don't mean the code itself, I mean this docs you are reading right now. It could be more explanatory, more detailed, more concise, etc. Any improvement would be appreciated. Even typos!
- **Github Actions**: Currently, only github actions regarding syncing the docs to their respective repositories are available. It would be nice to have more actions, such as testing, linting, and especially deployments. 

## License

Journal Stack is licensed under the [MIT License](./LICENSE.md).
