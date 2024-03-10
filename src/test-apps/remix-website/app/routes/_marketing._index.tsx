import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { OutlineButtonLink, PrimaryButtonLink } from "~/ui/buttons";
import { getMarkdownTutPage } from "~/lib/mdtut.server";
import type { Prose, Sequence } from "~/lib/mdtut.server";
import "~/styles/index.css";
import { Red } from "~/ui/gradients";
import { BigTweet, TweetCarousel, tweets } from "~/ui/twitter-cards";
import { ScrollExperience } from "~/ui/homepage-scroll-experience";
import invariant from "tiny-invariant";
import { Fragment } from "react";
import { getMeta } from "~/lib/meta";
import { CACHE_CONTROL } from "~/lib/http.server";

export const meta: MetaFunction<typeof loader> = (args) => {
  let { siteUrl } = args.data || {};
  let title = "Remix - Build Better Websites";
  let image = siteUrl ? `${siteUrl}/img/og.1.jpg` : undefined;
  let description =
    "Remix is a full stack web framework that lets you focus on the user interface and work back through web standards to deliver a fast, slick, and resilient user experience. People are gonna love using your stuff.";

  return getMeta({ title, description, siteUrl, image });
};

type LoaderData = {
  sample: Prose;
  sampleSm: Prose;
  siteUrl: string | undefined;
  mutations: Sequence;
  errors: Sequence;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let [[sample], [sampleSm], [, mutations], [, errors]] = await Promise.all([
    getMarkdownTutPage("marketing/sample/sample.md"),
    getMarkdownTutPage("marketing/sample-sm/sample.md"),
    getMarkdownTutPage("marketing/mutations/mutations.md"),
    getMarkdownTutPage("marketing/mutations/errors.md"),
  ]);

  invariant(sample.type === "prose", "sample.md should be prose");
  invariant(sampleSm.type === "prose", "sample.md should be prose");
  invariant(mutations.type === "sequence", "mutations.md should be a sequence");
  invariant(errors.type === "sequence", "errors.md should be a sequence");

  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  let data: LoaderData = {
    sample,
    sampleSm,
    siteUrl,
    mutations,
    errors,
  };

  return json(data, { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } });
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  // Inherit the caching headers from the loader so we do't cache 404s
  return loaderHeaders;
};

export default function Index() {
  let { mutations, errors } = useLoaderData<LoaderData>();
  return (
    <div x-comp="Index">
      <div className="h-8" />
      <Hero />
      <div className="h-32" />
      <section>
        <h2 className="sr-only">Testimonials</h2>
        <BigTweet tweet={tweets[0]} />
        <div className="h-10" />
        <TweetCarousel tweets={tweets.slice(1)} />
      </section>
      <div className="h-32" />
      <ScrollExperience mutations={mutations} errors={errors} />
    </div>
  );
}

function Hero() {
  let { sample, sampleSm } = useLoaderData<LoaderData>();
  return (
    <Fragment>
      <h1 className="sr-only">Welcome to Remix</h1>
      <section
        x-comp="Hero"
        className="px-6 sm:px-8 lg:flex lg:w-full lg:items-center lg:justify-between lg:gap-12"
      >
        <div className="lg:mb-10 lg:w-1/2">
          <div className="lg:mx-auto lg:max-w-2xl">
            <h2 className="font-display text-3xl font-black text-white xs:text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl">
              Focused on <span className="text-aqua-brand">web standards</span>{" "}
              and <span className="text-green-brand">modern web app</span> UX,
              you’re simply going to{" "}
              <span className="text-yellow-brand">build better websites</span>
            </h2>
            <div className="h-6" />
            <p className="xs:text-lg lg:text-xl xl:max-w-xl">
              Remix is a full stack web framework that lets you focus on the
              user interface and work back through web standards to deliver a
              fast, slick, and resilient user experience. People are gonna love
              using your stuff.
            </p>
            <div className="h-9 xl:h-10" />
            <div className="xl: flex flex-col gap-4 xl:flex-row">
              <PrimaryButtonLink
                prefetch="intent"
                to="/docs/start/quickstart"
                className="w-full xl:order-1 xl:w-60"
                children="Get Started"
              />
              <OutlineButtonLink
                prefetch="intent"
                to="/docs"
                className="w-full xl:w-60"
                children="Read the Docs"
              />
            </div>
          </div>
        </div>
        <div className="relative -mx-6 mt-6 overflow-hidden p-4 sm:-mx-8 sm:p-8 md:p-10 lg:mt-0 lg:h-[51rem] lg:w-1/2 lg:rounded-l-2xl lg:p-8">
          <Red className="absolute left-0 top-0 h-full xl:rounded-3xl" />
          <Sample html={sample.html} className="rounded-xl sm:hidden" />
          <Sample html={sampleSm.html} className="hidden sm:block" />
        </div>
      </section>
    </Fragment>
  );
}

function Sample({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={
        "relative overflow-auto bg-gray-800 p-3 text-sm sm:rounded-lg sm:text-base md:max-w-full lg:max-w-max xl:rounded-xl xl:p-4" +
        " " +
        className
      }
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}
