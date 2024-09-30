import { primaryButtonLinkClass } from "~/ui/buttons";
import type { MetaFunction } from "@remix-run/react";
import { metaV1 } from "@remix-run/v1-meta";

export const meta: MetaFunction = (args) => {
  return metaV1(args, {
    title: "Remix Conf Workshops",
    description: "Premium Remix Workshops from the Remix Team",
  });
};

export default function Workshops() {
  return (
    <div className="text-white">
      <h1 className="mb-16 font-display text-3xl font-extrabold sm:text-5xl xl:text-7xl">
        Premium Remix Workshops from the Remix Team
      </h1>
      <div className="container flex flex-col gap-4 text-lg lg:text-xl">
        <p>
          Remix workshops are a great way to get insights and experience from
          the Remix team on how to use Remix to build stellar user experiences.
          They happen the day before the conference at the venue. Lunch, snacks,
          and beverages are included.
        </p>
        <div className="text-center">
          <a
            href="https://rmx.as/tickets"
            className={`${primaryButtonLinkClass} font-display font-extrabold uppercase`}
            children="Get Tickets"
          />
        </div>
      </div>
      <div className="container mt-12 grid grid-cols-1 gap-12 lg:grid-cols-6">
        <div className="col-span-3 lg:col-span-2">
          <div className="mt-4 flex flex-col gap-6 text-lg lg:text-xl">
            <h2 className="font-display text-2xl font-extrabold lg:text-5xl">
              Your instructors
            </h2>
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
              <a
                className="flex flex-col gap-4 underline"
                href="https://twitter.com/kentcdodds"
              >
                <img
                  src="/authors/profile-kent-c-dodds.png"
                  alt="Kent C. Dodds"
                  className="w-36 rounded-md"
                />
                <span>Kent C. Dodds</span>
              </a>
              <a
                className="flex flex-col gap-4 underline"
                href="https://twitter.com/ryanflorence"
              >
                <img
                  src="/authors/profile-ryan-florence.png"
                  alt="Ryan Florence"
                  className="w-36 rounded-md"
                />
                <span>Ryan Florence</span>
              </a>
            </div>
          </div>
        </div>
        <div className="col-span-3 lg:col-span-4">
          <div className="mt-4 flex flex-col gap-6 text-lg lg:text-xl">
            <h2 className="font-display text-2xl font-extrabold lg:text-5xl">
              Web Apps with Remix
            </h2>
            <p>
              Learn to build state-of-the-art user interfaces on the web with
              Remix. If you've been wondering how to make the jump from
              "website" to "web app" with Remix, this is for you.
            </p>
            <p>At the end of this workshop, you'll know how to:</p>
            <ul className="list-inside list-disc">
              <li>
                Eliminate busy indicators with Optimistic UI (while still
                handling errors)
              </li>
              <li>
                Optimize Remix's automatic data revalidation after mutations
              </li>
              <li>
                Fetch data outside of navigations for data driven components
                like Combobox/Autocomplete
              </li>
              <li>
                Build global, animated navigation indicators, aware of
                submissions, revalidation, and redirects.
              </li>
              <li>Build skeleton UI for instant user feedback on navigation</li>
              <li>Step up your app's accessibility with focus management</li>
              <li>Map keyboard shortcuts to data mutations</li>
              <li>and more!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
