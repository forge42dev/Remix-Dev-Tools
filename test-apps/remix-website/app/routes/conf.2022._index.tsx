import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { metaV1 } from "@remix-run/v1-meta";
import type { MetaFunction } from "@remix-run/react";
import { OutlineButtonLink, primaryButtonLinkClass } from "~/ui/buttons";
import "~/styles/index.css";
import { Fragment } from "react";
import type { Sponsor, Speaker } from "~/lib/conf";
import { getSpeakers, getSponsors } from "~/lib/conf2022.server";
import { Link } from "~/ui/link";
import { CACHE_CONTROL } from "~/lib/http.server";

export const meta: MetaFunction<typeof loader> = (args) => {
  let { siteUrl } = args.data || {};
  let url = siteUrl ? `${siteUrl}/conf` : null;
  let title = "Remix Conf - May 24-25, 2022";
  let image = siteUrl ? `${siteUrl}/conf-images/og.1.png` : null;
  let description =
    "Join us in Salt Lake City, UT for our innaugural conference. Featuring distinguished speakers, workshops, and lots of fun in between. See you there!";
  return metaV1(args, {
    title,
    description,
    "og:url": url,
    "og:title": title,
    "og:description": description,
    "og:image": image,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": title,
    "twitter:description": description,
    "twitter:image": image,
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const speakersOrdered = await getSpeakers();
  const speakersShuffled = speakersOrdered
    // save a bit of data by not sending along the bio to the home page
    .map(
      ({
        // @ts-ignore
        bio,
        ...s
      }) => s,
    )
    .sort(() => Math.random() - 0.5);

  const allSponsors = await getSponsors();
  const sponsors = {
    premier: allSponsors.find((s) => s.level === "premier"),
    gold: allSponsors
      .filter((s) => s.level === "gold")
      .sort(() => Math.random() - 0.5),
    silver: allSponsors
      .filter((s) => s.level === "silver")
      .sort(() => Math.random() - 0.5),
    community: allSponsors
      .filter((s) => s.level === "community")
      .sort(() => Math.random() - 0.5),
  };

  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  return json(
    { siteUrl, speakers: speakersShuffled, sponsors },
    { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } },
  );
};

export default function ConfIndex() {
  return (
    <div x-comp="Index">
      <Hero />
      <Speakers />
      <Sponsors />
    </div>
  );
}

function Hero() {
  return (
    <Fragment>
      <section
        x-comp="Hero"
        className="__hero pb-10 pt-40 sm:pb-16 sm:pt-48 md:pb-24 md:pt-52 lg:pb-32 lg:pt-64"
      >
        <div className="container relative">
          <div className="mx-auto max-w-xl md:mx-0">
            <h1 className="__hero-text-shadow font-mono text-[length:32px] leading-tight sm:text-[length:45px] lg:text-[length:64px]">
              <div className="text-white">May 24-25, 2022 </div>
              <div className="text-yellow-brand">Salt Lake City</div>
            </h1>
            <div className="h-6" />
            <div className="__hero-text-shadow space-y-4 text-lg text-white lg:text-xl">
              <p>
                Remix is a full stack web framework that lets you focus on the
                user interface and work back through web standards to deliver a
                fast, slick, and resilient user experience.
              </p>
              <p className="font-bold">
                We can't wait to tell you all about it.
              </p>
            </div>
            <div className="h-9" />
          </div>
          <div className="flex w-full justify-center">
            <a
              href="https://www.youtube.com/playlist?list=PLXoynULbYuEC36XutMMWEuTu9uuh171wx"
              className={`${primaryButtonLinkClass} flex w-full gap-2 font-mono uppercase sm:gap-4 md:w-auto`}
            >
              <span aria-hidden>📺</span>
              <span>Watch the Recordings</span>
              <span aria-hidden>📺</span>
            </a>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

function Speakers() {
  const { speakers } = useLoaderData<typeof loader>();
  const mc = speakers.find((s) => s.type === "emcee");
  const talkSpeakers = speakers.filter((s) => s.type !== "emcee");
  return (
    <section className="__section-speakers py-20" id="speakers">
      <div className="container relative">
        <h2 className="mb-6 text-center font-mono font-semibold uppercase md:mb-8">
          Speakers
        </h2>
        <div className="mx-auto max-w-xs px-6 sm:max-w-2xl lg:max-w-5xl lg:px-10">
          <div className="flex flex-col flex-wrap items-start justify-center gap-y-12 sm:flex-row sm:gap-x-8 sm:gap-y-14 md:gap-x-8 2xl:gap-x-10">
            {talkSpeakers.map((speaker) => (
              <SpeakerDisplay
                speaker={speaker}
                key={speaker.name}
                className="basis-72"
              />
            ))}
          </div>
        </div>
        {mc ? (
          <div id="mc">
            <h2 className="mb-6 mt-24 text-center font-mono font-semibold uppercase md:mb-8">
              Master of Ceremonies
            </h2>
            <div className="m-auto flex justify-center">
              <SpeakerDisplay speaker={mc} className="basis-72" />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SpeakerDisplay({
  speaker,
  className = "",
}: {
  speaker: Omit<Speaker, "bio">;
  className?: string;
}) {
  return (
    <Link
      to={`speakers/${speaker.slug}`}
      className={`__speaker-link flex h-full w-full items-center justify-center ${className}`}
      aria-label={`${speaker.name}, ${speaker.title}`}
      prefetch="intent"
    >
      <div className="w-full max-w-xs sm:max-w-none">
        <div className="__speaker-img aspect-h-1 aspect-w-1 overflow-hidden rounded-md bg-black">
          <img src={speaker.imgSrc} alt={speaker.name} title={speaker.name} />
        </div>
        <div className="mt-4">
          <h3>{speaker.name}</h3>
          <p className="text-sm">{speaker.title}</p>
          <p className="mt-2 text-sm font-semibold uppercase">
            {speaker.linkText}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Sponsors() {
  const { sponsors } = useLoaderData<typeof loader>();
  return (
    <section id="sponsors" className="container py-20">
      <div className="max-w-full overflow-hidden md:container md:max-w-5xl">
        <h2 className="sr-only">Sponsors</h2>
        <div className="flex flex-col gap-20 text-center lg:gap-36">
          {sponsors.premier ? (
            <div className="pb-8 lg:pb-20">
              <h3 className="mb-6 font-mono font-semibold uppercase md:mb-8">
                Premier Sponsor
              </h3>
              <div className="m-auto w-full max-w-[400px]">
                <div className="border-200 inline-block border-2 bg-white">
                  <a href={sponsors.premier.link}>
                    <img
                      src={sponsors.premier.imgSrc}
                      alt={sponsors.premier.name}
                      className="max-h-full max-w-full p-12"
                    />
                  </a>
                </div>
              </div>
            </div>
          ) : null}
          <div>
            <h3 className="mb-6 font-mono font-semibold uppercase md:mb-8">
              Gold Sponsors
            </h3>
            <SponsorsList sponsors={sponsors.gold} level="gold" />
          </div>
          <div>
            <h3 className="mb-6 font-semibold uppercase md:mb-8">
              Silver Sponsors
            </h3>
            <SponsorsList sponsors={sponsors.silver} level="silver" />
          </div>
          <div>
            <h3 className="mb-6 font-mono font-semibold uppercase md:mb-8">
              Community Partners
            </h3>
            <SponsorsList sponsors={sponsors.community} level="community" />
          </div>
        </div>
        <div className="mt-20 flex justify-center">
          <OutlineButtonLink
            prefetch="intent"
            to="sponsor"
            className="w-full font-mono uppercase md:w-auto"
            children="Join the Sponsors"
          />
        </div>
      </div>
    </section>
  );
}

function SponsorsList({
  sponsors,
  level,
}: {
  sponsors: Array<Sponsor>;
  level: Sponsor["level"];
}) {
  const size = {
    premier: "",
    gold: "w-[250px] h-[250px]",
    silver: "w-[200px] h-[200px]",
    community: "w-[150px] h-[150px]",
  }[level];

  const ulClassName = {
    premier: "",
    gold: "max-w-[36rem] gap-8 md:gap-12 lg:gap-14",
    silver: "max-w-[46rem] gap-6 md:gap-10 lg:gap-12",
    community: "max-w-[46rem] gap-4 md:gap-8 lg:gap-10",
  }[level];

  return (
    <div>
      <ul
        className={`${ulClassName} m-auto flex list-none flex-wrap items-center justify-center`}
      >
        {sponsors.map((sponsor) => (
          <li key={sponsor.name} className={`${size}`}>
            <div className="border-200 h-full w-full border-2 bg-white">
              <a
                href={sponsor.link}
                className="flex h-full w-full items-center justify-center"
              >
                <img
                  src={sponsor.imgSrc}
                  alt={sponsor.name}
                  title={sponsor.name}
                  className="max-h-full max-w-full p-3"
                />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
