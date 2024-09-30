---
title: Future Proofing Your Remix App
summary: We've introduced the concept of future flags to give you a smooth upgrade path for your Remix app.
featured: false
date: 2023-03-17
image: /blog-images/headers/the-future-is-now.jpg
imageAlt: The Future is Now
authors:
  - Matt Brophy
---

At Remix, we know first-hand just how painful it can be to go through a major version upgrade. Especially for something as foundational to your application as the framework or router it's built on. We want to do our very best to provide you a best-in-class upgrade experience -- let's talk about **"Future Flags"**.

## Status Quo

Every[^1] framework (or library) out there will _at some point_ have to introduce a breaking change. Something that will cause your code _as it's written today_ to break on the new version. This could result in a build-time (or even worse, a run-time) error. But these changes are good! It's how our frameworks evolve, get faster, adopt new platform features, implement community-driven feature requests, and so-on.

Out of this inherent need for breaking changes came the [Semantic Versioning][semver] (SemVer) specification which defines that breaking changes dictate a new _major_ release version. This is great because it lets application developers know when they should expect their code to require changes on an upgrade, versus when they should expect the upgrade to "just work". Remember though, you should always be reading the release notes and not just blindly upgrading 😉.

[^1]: "Every" and not "All" because I'm sure there's _some_ library out there like `add` that has been humming along at v1.0.0 for years without breaking changes because ... well the semantics of mathematics don't change all that frequently. But you get the idea - things evolve and require breaking changes, unless you're the [DOM][dom] which does a wonderful job with backwards-compatibility.

Conveniently enough, the same day I started writing this article, `@devagrawal09` [tweeted][tweet-5-years] the following which generated a relevant thread of the current state of frameworks and their handling of "major rewrites."

<img alt="Tweet from @devagrawal09 asking 'which javascript framework has lived more than 5 years without causing major rewrites?'" src="/blog-images/posts/future-flags/tweet.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Check back with Remix in 2026!</figcaption>

It's clear from the thread that folks have varying interpretations of "major rewrites," and that frameworks have done this with varying degrees of success over the years. Part of why things are not cut-and-dry here is that while SemVer gives us a way to communicate _when_ breaking changes exist - we do not have a similar agreed-upon process of _how_ to introduce breaking changes in our frameworks and communicate them to application developers.

Generally speaking the minimal bar for a major SemVer release is a set of release notes which outline the breaking changes in the major release. Ideally these also include instructions on how to go about changing your code to adopt the breaking changes. But that's really it - beyond that there's very little standardization around how to best prepare and help your users adopt breaking changes across major releases.

For that reason, we've seen a variety of different approaches over the years, including but not limited to:

- Writing a detailed **migration guide** [<sup>1</sup>][react-router-v6-migration-guide] [<sup>2</sup>][angular-v2-migration-guide] [<sup>3</sup>][express-v4-migration-guide]
- Releasing a **preparation version** prior to the major release to better prep your code to adopt the breaking changes [<sup>1</sup>][angular-1.5.0]
- Releasing a **compatibility package** that allows you to run both versions together [<sup>1</sup>][react-router-v6-back-compat] [<sup>2</sup>][vue-migration-build] [<sup>3</sup>][ngupgrade]

We've seen approaches that work well, and some that don't. However there seems to be a concept consistent across the success stories which is providing a path for application developers to upgrade their applications **iteratively**. At scale, the inability to iteratively upgrade portions of an application becomes problematic. You end up with a long lived `version-N-upgrade` branch that some engineer ends up thanklessly rebasing onto the latest `main` branch on a regular basis, and probably pulling their hair out bit-by-bit in the process.

These long-lived feature branches also tend to be very slow to move along. Our stakeholders don't _want_ to stop feature development for a few weeks so we can upgrade our stacks (which are invisible to the customer) - they want to keep shipping new features in parallel. So not only are teams only allocating a portion of their capacity to the upgrade, they're also dealing with the inherent context switching between the old and new worlds. This causes the upgrade to move even slower.

## Feature Branches

If we look at the how some of the above approaches play out for the application developers, we often see that they all involve some form of a long-lived feature branch which incurs the downsides mentioned above. In all cases, the lifetime of the feature branch is dictated by the number of breaking changes, but even with only a few breaking changes - it can take a bit of time to address those changes in a large codebase.

**Migration Guides** are generally followed and implemented in a feature branch.

<img alt="Diagram of a long lived feature branch for implementing the changes from a migration guide" src="/blog-images/posts/future-flags/migration-guide.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Long-lived feature branch for a migration guide</figcaption>

**Preparation Versions** tend to split the work into 2 feature branches - one to upgrade to the preparation version and another for the major version. This is a marginally better approach, but these individual branches still comes with the same downsides.

<img alt="Diagram of 2 shorter-lived feature branches for implementing the changes from a preparation version" src="/blog-images/posts/future-flags/prep-version.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">2 medium-lived feature branches for a preparation version</figcaption>

**Migration Builds** and/or backwards compatibility flags do an even better job of eliminating the long lived feature branches, but they still come with 2 aspects that are not ideal. First, they present a bit of underlying technical risk as running two packages side by side (v2 and v2 "back-compat") is not quite the same as running v2 -- so there is a non-zero surface area for bugs to pop up across the inter-communication of the packages. Second, and probably more importantly, these still dump _all_ of the new features (and breaking changes) on you all at once. There's often very little you can do _in advance_ to prepare your codebase for the upgrade and to lessen the impact. Once v2 releases, you can _potentially_ avoid the long-lived feature branch by upgrading to the new version and back-compat package. But then you're playing catch up on your main branch for a while as you adopt the breaking changes iteratively and eventually remove the compatibility build or back-compat flags.

<img alt="Diagram of many short-lived branches to implement features via a migration build" src="/blog-images/posts/future-flags/back-compat.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Migration builds allow iterative feature adoption after the release</figcaption>

We're not thrilled with any of these approaches, and are hoping that we can provide an even smoother path through major upgrades.

## Introducing Future Flags

When we first started talking about how to handle breaking changes for Remix, I couldn't help but think back to the [Stability without Stagnation][stability-without-stagnation] talk I watched Yehuda Katz give at [Philly ETE 2016][philly-ete-2016]. I wasn't an Ember developer but that talk left a huge impression on me[^2] about how frameworks could ease the pain of new feature adoption on their users through the use of feature flags. Ryan Florence, however, _was_ an active Ember developer so when I mentioned this talk he immediately knew the "Stability without Stagnation" phrase.

[^2]: This may have been so relevant to me because just 2 months before that talk AngularJs 1.5.0 had been released in an attempt to provide a smoother path to Angular v2. At the time, I was the lead developer on a large AngularJs 1.4.0 e-commerce checkout app and we were well on our way to realizing that Angular v2 was not going to be an upgrade, but rather a full-rewrite 😕.

Later on in my career working on a Vue SSR application, we were preparing for a Vue 2 -> 3 upgrade and I was very excited to see the [Feature Flags][vue-migration-build-feature-flags] they were introducing in their build (although I switched jobs prior to performing that upgrade so I don't know how smooth it went).

We knew at Remix that this concept of feature flags was _crucial_ if we wanted to be able to provide a smooth upgrade experience for our users. But we wanted to go even further than we have before with our OSS. Even in the best approaches above with backwards-compatibility flags - developers are still left with a "here's all the new stuff at once" dump in a major version - leaving them to play catch-up for a period of time. Furthermore this also sort of stacks up all of the v2 code changes one after another, giving you a compacted surface area for potentially nuanced bugs. We wanted to see if we could do better.

At Remix, our goal introducing breaking changes in major versions is two-fold:

1. _Eliminate_ the need for a long-lived feature branch
2. Let you opt-into breaking changes _for the next version_ individually _as they are released in the current version_

Said another way, most approaches we've seen try to give you an off-ramp from v1 to v2 _after v2 is released_. Instead, Remix aims to provide you a bunch of small on-ramps to _eventual_ v2 features as they are released _in v1 releases_. If all goes as plan and you stay up to date as new "on ramps" come out, then your code _as it's written today_ will "just work" when you upgrade to a new major version. This effectively makes major version upgrades no more painful than minor version upgrades 🤯.

<img alt="Diagram of the lack of a feature branches for adopting v2 features via future flags" src="/blog-images/posts/future-flags/future-flags.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Future flags eliminate the need for adoption after the release</figcaption>

Additionally, by introducing these features _over-time_ in v1 - we provide a much larger surface area in which application developers can spread out their v2-related code changes.

<img alt="Diagram of the gradual adoption of v2 feature via future flags through the v1 lifetime" src="/blog-images/posts/future-flags/future-flags-v1.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Features can be adopted gradually throughout the v1 lifetime</figcaption>

We understand this is a lofty goal, and we know it may not work out exactly as we plan all the time, but we're serious about stability and want to makes sure that our process is considering the burden a major version upgrade can put on our application developers.

We plan to do this via what we're calling **future flags** in the `remix.config.js` file. Think of these as **feature flags for future features** (now say that 5 times fast 😉). As we implement new features, we always try to do them in a backwards-compatible way. But when we can't and decide a breaking change is warranted, we don't table that feature up for an _eventual_ v2 release. Instead, we add a **future flag** and implement the new feature alongside the current behavior in a v1 minor release. This allows users to start using the feature, providing feedback, and reporting bugs _immediately_.

That way, not only can you adopt features incrementally (and eagerly without a major version bump), we can also work out any kinks incrementally _before_ releasing v2. Eventually we also then add deprecation warnings to the v1 releases to nudge users to the new behavior. Then in v2 we remove the old v1 approach, remove the deprecations, and remove the flag - thus making the flagged behavior the new default in v2. If at the time v2 is released, an application has opted into _all_ future flags and updated their code - then they should just be able to update their Remix dependencies to v2 and delete the future flags from their `remix.config.js` and be running on v2 in a matter of minutes.

## Unstable vs. V2 Flags

Future flags can come in one of 2 forms: `future.unstable_feature` or `future.v2_feature` and the lifecycle of a flag will depend on the nature of the change and if it's breaking or not. The decision flow for a new feature looks something like this:

<a href="/blog-images/posts/future-flags/feature-flowchart.png" target="_blank"><img alt="Flowchart of the decision process for how to introduce a new feature" src="/blog-images/posts/future-flags/feature-flowchart.png" class="border rounded-md p-3 shadow" /></a>

<figcaption class="my-2">Flowchart for introducing new features (click to open in a new tab)</figcaption>

The lifecycle is thus either:

- Non-Breaking + Stable API Feature -> Lands in v1
- Non-Breaking + Unstable API -> `future.unstable_` flag -> Lands in v1
- Breaking + Stable API Feature -> `future.v2_` flag -> Lands in v2
- Breaking + Unstable API -> `future.unstable_` flag -> `future.v2_` flag -> Lands in v2

And for clarification - `unstable_` here _does not mean_ that we think the feature is bug-ridden! It means that we're not 100% confident the API won't undergo some minor changes before it stabilizes. We _absolutely_ want Early Adopters to start using these features so we can iterate on (or gain confidence in) the API.

And furthermore, a `v2_` flag does not mean the feature is bug-free - no software is! This means that we are confident in the API and consider it the stable API for the default behavior in v2. This means that if you update your code to use this new API in v1, you can make your v2 upgrade _much_ smoother.

## Current Future Flags in Remix v1

Here's a list of the current flags in Remix v1 today:

- `unstable_cssModules` - Enable CSS Modules Support
- `unstable_cssSideEffectImports` - Enable CSS Side Effect imports
- `unstable_dev` - Enable the new development server (including HMR/HDR support)
- `unstable_postcss` - Enable PostCSS Support
- `unstable_tailwind` - Enable TailwindCSS support
- `unstable_vanillaExtract` - Enable Vanilla Extract Support
- `v2_errorBoundary` - Combine `ErrorBoundary`/`CatchBoundary` into a single `ErrorBoundary`
- `v2_meta` - Enable the new API for your `meta` functions
- `v2_routeConvention` - Enable the flat routes style of file-based routing

We're in the process of preparing for our v2 release, so all `future.unstable_` flags are being stabilized into `future.v2_` flags (except for those which are not breaking changes, like PostCSS/Tailwind/Vanilla Extract support). This includes adding deprecation warnings for apps still using the old way. Once we stabilize them all we'll do a final Remix 1.15.0 release and let that run for a bit to give folks time to opt into any flags they haven't yet added. Then we'll plan to release Remix 2.0.0 and start working on releasing flag-driven Remix v3 features.

In the future, check out the [docs][future-flags-docs] on this strategy for an up -to-date listing of active future flags.

[future-flags-docs]: https://remix.run/docs/en/main/pages/api-development-strategy
[semver]: https://semver.org/
[dom]: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
[react-router-v6-migration-guide]: https://reactrouter.com/upgrading/v5#introduction
[react-router-v6-back-compat]: https://reactrouter.com/upgrading/v5#backwards-compatibility-package
[angular-v2-migration-guide]: https://angular.io/guide/upgrade
[ngupgrade]: https://angular.io/guide/upgrade#upgrading-with-ngupgrade
[angular-1.5.0]: https://www.infoworld.com/article/3031266/angular-150-paves-the-way-for-angular-2.html
[tweet-5-years]: https://twitter.com/devagrawal09/status/1631153991215202304
[express-v4-migration-guide]: https://expressjs.com/en/guide/migrating-4.html
[vue-migration-build]: https://v3-migration.vuejs.org/migration-build.html
[vue-migration-build-feature-flags]: https://v3-migration.vuejs.org/migration-build.html#feature-reference
[philly-ete-2016]: https://2016.phillyemergingtech.com/schedule/
[stability-without-stagnation]: https://www.youtube.com/watch?v=R6x7ZGUL3Sk
