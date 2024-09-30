import type { MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Conf 2023 Sponsorship" },
    { description: "Sponsorship opportunities for Remix Conf." },
  ];
};

export default function SponsorUs() {
  return (
    <div>
      <div className="">
        <h1 className="mb-5 font-display text-3xl font-extrabold text-white sm:mb-8 sm:text-5xl lg:mb-16 lg:text-6xl">
          Become a Remix Conf Sponsor
        </h1>
        <div className="flex flex-col gap-3 text-lg lg:gap-4 lg:text-xl">
          <p>
            We're excited you're interested in sponsoring the conference!
            Sponsoring Remix Conf will connect your company and brand to a group
            of <strong>experienced</strong> software engineers (and their
            managers) looking into the latest and greatest technology for
            building web applications.
          </p>
          <p>
            If that sounds interesting to you, please email us at{" "}
            <a className="font-bold underline" href="mailto:conf@remix.run">
              conf@remix.run
            </a>
            .
          </p>
          <p>We look forward to hearing from you!</p>
        </div>
      </div>
    </div>
  );
}
