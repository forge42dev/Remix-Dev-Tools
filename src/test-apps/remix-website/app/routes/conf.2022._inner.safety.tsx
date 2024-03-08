import type { MetaFunction } from "@remix-run/react";
import { metaV1 } from "@remix-run/v1-meta";

export const meta: MetaFunction = (args) => {
  return metaV1(args, {
    title: "Remix Conf Discord Server",
    description: "Much of our coordination happens on Discord.",
  });
};

export default function Safety() {
  return (
    <div>
      <h1 className="mb-16 font-display text-3xl font-extrabold text-white sm:text-5xl xl:text-7xl">
        COVID-19 and Participant Safety
      </h1>
      <div className="container flex flex-col gap-4 text-lg text-white lg:text-xl">
        <p>
          Remix Conf is committed to making sure everyone is safe and healthy.
          Like everyone else, we're monitoring the COVID situation and will
          adjust plans as necessary. We'll keep all attendees and sponsors
          informed if changes to the schedule or venue are made.
        </p>
        <p>
          In addition to following{" "}
          <a className="underline" href="https://coronavirus.utah.gov/">
            local requirements
          </a>{" "}
          we will be implementing a system to help you know the comfort level of
          physical contact one another while at the conference (no contact, fist
          bumps, hand shakes, etc.).
        </p>
        <p>
          If you are not vaccinated, please{" "}
          <a className="underline" href="https://www.testutah.com/">
            get tested
          </a>{" "}
          before attending
          {"."}
        </p>
        <p>
          If you have any questions or concerns, please email us at{" "}
          <strong>
            <a className="underline" href="mailto:conf@remix.run">
              conf@remix.run
            </a>
            {". "}
          </strong>
        </p>
      </div>
      <img
        className="m-auto mt-16 block w-48"
        src="/conf-images/covid-image.png"
        alt="COVID-19 sticker saying I got my covid-19 vaccine"
      />
    </div>
  );
}
