import { Twitter } from "./icons";
import cx from "clsx";

export type TweetData = {
  href: string;
  name: string;
  username: string;
  title: string;
  body: string;
  avatar: string;
};

export const tweets: TweetData[] = [
  {
    href: "https://twitter.com/jjenzz/status/1459941582912827398",
    username: "jjenzz",
    name: "Jenna Smith",
    title: "Radix UI",
    body: "I've been waiting for something to encourage progressive enhancement in the React space *forever* and Remix truly is so much more. Proving we don't need to sacrifice React or choose SSG for a lightning fast, accessible UI, and the DX makes it all too easy 🤤",
    avatar: "/img/jenna.jpg",
  },
  {
    href: "https://twitter.com/jkup/status/1456360115205033989",
    username: "jkup",
    name: "Jon Kuperman",
    title: "Cloudflare",
    body: "holy 💩 Remix is good",
    avatar: "/img/jkup.jpg",
  },
  {
    href: "https://twitter.com/aweary/status/1456399484473200644",
    username: "aweary",
    name: "Brandon Dail",
    title: "Discord, prev React Core",
    body: "I just rewrote my first Remix app on top of Cloudflare Workers and Supabase and it’s so damn good",
    avatar: "/img/aweary.jpg",
  },
  {
    href: "https://twitter.com/TAbrodi/status/1459531154533634048",
    username: "TAbrodi",
    name: "Tiger Abrodi",
    title: "Software Developer",
    body: "My mind is still blown away with Remix! So easy and elegant 😩. I love how it also focuses on Accessibility (Progressive Enhancement...) 🤯, A few days ago I was like wazzup with remix, we got Next.js and Svelte 😴 ... and now I'm fired up like crazy 😂. This is so good 🤤",
    avatar: "/img/tiger.jpg",
  },
  {
    href: "https://twitter.com/sergiodxa/status/1400503400802959361",
    username: "sergiodxa",
    name: "Sergio Xalambrí",
    title: "Daffy, prev Vercel",
    body: "What’s really cool with Remix loaders is that you can do most of your data transformation and calculations there, like check if a list is empty, limit the number of records, only send specific attributes, so your React component just receives the data and renders it, no logic needed",
    avatar: "/img/sergio.jpg",
  },
  {
    href: "https://twitter.com/elrickvm/status/1458918740918251524",
    username: "elrickvm",
    name: "Elrick Ryan",
    title: "Fullstack Dev, Frontside",
    body: "Remix is going to put developers on the Hot Path to build accessible, scaleable, and performant apps, that have stellar user experiences and amazing developer ergonomics. It's not only going to be a win for developers, but also a big win for the end-users!",
    avatar: "/img/elrick.jpg",
  },
  {
    href: "https://twitter.com/theflyingcoder1/status/1456407168291278851",
    username: "theflyingcoder1",
    name: "Tom Rowe",
    title: "Fullstack Developer",
    body: "In my opinion @remix_run will be game changer for corporate teams hesitant to adopt full stack JavaScript. The core concepts are so intuitive you can pick it up in a day, and it will even integrate into your existing stack.",
    avatar: "/img/tom.jpg",
  },
  {
    href: "https://twitter.com/wisecobbler/status/1388174702900772868",
    username: "wisecobbler",
    name: "Sophia Shoemaker",
    title: "Software Engineer, Box",
    body: "I love what @mjackson and @ryanflorence are doing with Remix! Deploying to AWS Lambda in under 30 seconds 🤯",
    avatar: "/img/sophia.jpg",
  },
  {
    href: "https://twitter.com/meindertsmajens/status/1454393707604680711",
    username: "meindertsmajens",
    name: "Jens Meindertsma",
    title: "Web Developer",
    body: "Building with @remix_run has been awesome so far. Having used Next.js for applications for years, the nested layouts are a wonderful feature. I also haven't learned this much about the web in years.",
    avatar: "/img/jens.jpg",
  },
  {
    href: "https://twitter.com/cammchenry/status/1447267585456812039",
    username: "cammchenry",
    name: "Cameron McHenry",
    title: "Web Developer",
    body: "I love using @remix_run for my website.  Remix has improved my productivity as a front-end developer by empowering me to seamlessly switch between front-end and back-end code.",
    avatar: "/img/cammchenry.jpg",
  },
  {
    href: "https://twitter.com/airuyi/status/1456438853804298244",
    username: "airuyi",
    name: "Fergus Meiklejohn",
    title: "App Developer",
    body: "If you're doing #webdevelopment you should check out Remix 🔥 It's a new (old) paradigm for web dev, which simplifies our code, especially state management😅, speeds up our page loads, and gives us a mental model and framework we can rely on to create our best work",
    avatar: "/img/airuyi.jpg",
  },
];

export function Avatar({
  src,
  className,
  alt,
}: {
  src: string;
  className?: string;
  alt: string;
}) {
  return (
    <div className={cx("h-12 w-12", className)}>
      <img src={src} className="rounded-full object-cover" alt={alt} />
    </div>
  );
}

export function TweetCarousel({ tweets }: { tweets: TweetData[] }) {
  return (
    <div className="mx-auto max-w-max">
      <div className="__carousel flex gap-6 overflow-x-scroll md:pb-4">
        {tweets.map((tweet, index) => (
          <figure
            key={index}
            className="__slide w-[80vw] shrink-0 rounded-lg bg-gray-800 p-8 text-white sm:p-10 md:w-[43vw] xl:w-[30rem]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar alt="" src={tweet.avatar} />
                <figcaption>
                  <a
                    href={tweet.href}
                    className="block font-display text-xl font-extrabold md:text-xl"
                    aria-label={`Tweet from ${tweet.name}`}
                  >
                    @{tweet.username}
                  </a>
                  <div className="text-sm lg:text-base">{tweet.title}</div>
                </figcaption>
              </div>
              <a
                href={tweet.href}
                className="block"
                aria-label={`Tweet from ${tweet.name}`}
                tabIndex={-1}
              >
                <Twitter className="h-6 w-6" role="presentation" />
              </a>
            </div>
            <div className="h-6" />
            <blockquote className="text-sm text-gray-200 xl:text-base">
              {tweet.body}
            </blockquote>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function BigTweet({ tweet }: { tweet: TweetData }) {
  return (
    <figure className="mx-auto max-w-xl p-6 sm:p-8">
      <div className="flex items-center justify-center gap-4 text-white">
        <div className="flex">
          <Avatar alt="" src={tweet.avatar} className="relative z-10" />
          <Twitter
            role="presentation"
            className="relative -left-4 h-12 w-12 text-white"
          />
        </div>
        <figcaption>
          <a
            href={tweet.href}
            target="_blank"
            rel="noreferrer"
            className="block font-display text-xl font-extrabold md:text-3xl"
            aria-label={`Tweet from ${tweet.name}`}
          >
            {tweet.name}
          </a>
          <span className="sr-only">, </span>
          <div className="text-lg uppercase">{tweet.title}</div>
        </figcaption>
      </div>
      <div className="h-10" />
      <blockquote className="text-center text-lg leading-6 md:text-xl">
        {tweet.body}
      </blockquote>
    </figure>
  );
}
