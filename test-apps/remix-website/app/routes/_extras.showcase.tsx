import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Fragment, forwardRef, useEffect, useRef } from "react";
import type { ShowcaseExample } from "~/lib/showcase.server";
import { showcaseExamples } from "~/lib/showcase.server";
import { clsx } from "clsx";
import { CACHE_CONTROL } from "~/lib/http.server";
import { useHydrated } from "~/ui/primitives/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  return json(
    { siteUrl, showcaseExamples },
    { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } },
  );
};

// Stolen from _marketing._index.tsx. eventually would like to replace
export const meta: MetaFunction<typeof loader> = (args) => {
  let { siteUrl } = args.data || {};
  let title = "Remix Showcase";
  let image = siteUrl ? `${siteUrl}/img/og.1.jpg` : null;
  let description = "See who is using Remix to build better websites.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:url", content: `${siteUrl}/showcase` },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:creator", content: "@remix_run" },
    { name: "twitter:site", content: "@remix_run" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

export default function Showcase() {
  let { showcaseExamples } = useLoaderData<typeof loader>();
  // Might be a bit silly to declare here and then prop-drill, but was a little concerned about a needless useEffect+useState for every card
  let isHydrated = useHydrated();

  return (
    <main
      className="container mt-8 flex flex-1 flex-col items-center"
      tabIndex={-1} // is this every gonna be focused? just copy pasta
    >
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
          Remix Showcase
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-light">
          Checkout the companies, organizations, nonprofits, and indie
          developers building better websites with Remix
        </p>
      </div>
      <ul className="mt-8 grid w-full max-w-md grid-cols-1 gap-x-6 gap-y-10 self-center md:max-w-3xl md:grid-cols-2 lg:max-w-6xl lg:grid-cols-3 lg:gap-x-8">
        {showcaseExamples.map((example, i) => {
          let preload: ShowcaseTypes["preload"] = i < 6 ? "auto" : "none";
          return (
            <Fragment key={example.name}>
              <DesktopShowcase
                // Non-focusable since focusing on the anchor tag starts the video -- need to
                // ensure that this is fine for screen readers, but I'm fairly confident the
                // video is not critical information and just visual flair so I don't think
                // we're providing an unusable or even bad experience to screen-reader users
                isHydrated={isHydrated}
                preload={preload}
                {...example}
              />
              <MobileShowcase
                isHydrated={isHydrated}
                asImage={i > 5}
                // Only preload the first 2, since that's about all that should be "above the fold" on mobile
                preload={i < 2 ? "auto" : "none"}
                {...example}
              />
            </Fragment>
          );
        })}
      </ul>
    </main>
  );
}

type ShowcaseTypes = ShowcaseExample & {
  preload?: "auto" | "metadata" | "none";
  isHydrated: boolean;
};

function DesktopShowcase({
  name,
  description,
  link,
  imgSrc,
  videoSrc,
  preload,
  isHydrated,
}: ShowcaseTypes) {
  let videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <li className="relative hidden overflow-hidden rounded-md border border-gray-100 shadow hover:shadow-blue-200 dark:border-gray-800 md:block">
      <ShowcaseVideo
        ref={videoRef}
        videoSrc={videoSrc}
        poster={imgSrc}
        autoPlay={false}
        preload={preload}
        isHydrated={isHydrated}
      />
      <ShowcaseDescription
        name={name}
        description={description}
        link={link}
        isHydrated={isHydrated}
        playVideo={() => videoRef.current?.play()}
        pauseVideo={() => videoRef.current?.pause()}
      />
    </li>
  );
}

function MobileShowcase({
  name,
  description,
  link,
  imgSrc,
  videoSrc,
  asImage = false,
  isHydrated,
  preload,
}: ShowcaseTypes & {
  /** Opt into only showing an image. This avoids loading a ton of videos on the page and crashing Brooks' terrible phone */
  asImage?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  // autoplay videos -- using this useEffect because the `autoPlay` attribute overrides
  // `preload="none"` which causes weird infinite loading issues when caching is turned off
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (node.paused) {
      node.play();
    }
  }, []);

  return (
    <li className="relative block overflow-hidden rounded-md border border-gray-100 shadow hover:shadow-blue-200 dark:border-gray-800 md:hidden">
      {/* If it's an image, don't render the video, and remove the motion-safe class */}
      {!asImage ? (
        <ShowcaseVideo
          ref={ref}
          className="motion-reduce:hidden"
          videoSrc={videoSrc}
          poster={imgSrc}
          preload={preload}
          isHydrated={isHydrated}
        />
      ) : null}
      {/* prefers-reduced-motion displays just an image even when there's a video */}
      <ShowcaseImage
        className={!asImage ? "motion-safe:hidden" : undefined}
        src={imgSrc}
      />
      <ShowcaseDescription
        name={name}
        description={description}
        link={link}
        isHydrated={isHydrated}
      />
    </li>
  );
}

let ShowcaseVideo = forwardRef<
  HTMLVideoElement,
  Pick<ShowcaseTypes, "videoSrc" | "isHydrated"> &
    React.VideoHTMLAttributes<HTMLVideoElement>
>(({ videoSrc, className, isHydrated, ...props }, ref) => {
  return (
    <div className={clsx("aspect-[4/3] object-cover object-top", className)}>
      <video
        ref={ref}
        className="max-h-full w-full max-w-full"
        disablePictureInPicture
        disableRemotePlayback
        playsInline
        loop
        muted
        width={800}
        height={600}
        // Note: autoplay must be off for this strategy to work, if autoplay is turned on all assets will be downloaded automatically
        tabIndex={isHydrated ? -1 : 0}
        {...props}
      >
        {["webm", "mp4"].map((ext) => (
          <source
            key={ext}
            src={`${videoSrc}.${ext}`}
            type={`video/${ext}`}
            width={800}
            height={600}
          />
        ))}
      </video>
    </div>
  );
});

function ShowcaseImage({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <div className={clsx("aspect-[4/3] object-cover object-top", className)}>
      <img
        className="max-h-full w-full max-w-full"
        width={800}
        height={600}
        alt=""
        {...props}
      />
    </div>
  );
}

function ShowcaseDescription({
  description,
  link,
  name,
  isHydrated,
  playVideo,
  pauseVideo,
}: Pick<ShowcaseTypes, "description" | "link" | "name" | "isHydrated"> & {
  playVideo?: () => void;
  pauseVideo?: () => void;
}) {
  return (
    <div
      className={clsx("p-4", {
        // relative position in combination with the inner span makes the whole card clickable
        // only after hydration do we want it to be the size of the whole card, otherwise this
        // will get in the way of controlling the video
        relative: !isHydrated,
      })}
    >
      <h2 className="font-medium hover:text-blue-brand">
        <a
          href={link}
          rel="noopener noreferrer"
          target="_blank"
          onFocus={playVideo}
          onBlur={pauseVideo}
        >
          <span
            onMouseOver={playVideo}
            onMouseOut={pauseVideo}
            className="absolute inset-0"
          />

          {name}
        </a>
      </h2>
      <p className="pt-2 text-xs font-light">{description}</p>
    </div>
  );
}
