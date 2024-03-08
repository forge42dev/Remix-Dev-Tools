import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { metaV1 } from "@remix-run/v1-meta";
import { getSchedule } from "~/lib/conf2022.server";
import { CACHE_CONTROL } from "~/lib/http.server";
import { slugify } from "~/ui/primitives/utils";

export const meta: MetaFunction = (args) => {
  return metaV1(args, {
    title: "May 25th at Remix Conf",
    description: "May 25th is the day of the conference at Remix Conf.",
  });
};

type LoaderData = { scheduleItems: Awaited<ReturnType<typeof getSchedule>> };

export const loader: LoaderFunction = async () => {
  const scheduleItems = await getSchedule();
  return json<LoaderData>(
    { scheduleItems },
    { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } },
  );
};

export default function May25Schedule() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <div>
        <small>9:00am - 4:30pm</small>{" "}
        <small>(This schedule may change.)</small>
        <table className="mt-6 w-full border-collapse">
          <thead className="sr-only">
            <tr>
              <th>Time</th>
              <th>Talk Details</th>
            </tr>
          </thead>
          <tbody>
            {data.scheduleItems.map((scheduleItem) => (
              <tr
                key={scheduleItem.time}
                className="border-b border-t border-gray-200"
                id={`time-${slugify(scheduleItem.time)}`}
              >
                <td className="whitespace-nowrap px-2 py-8 lg:py-16">
                  {scheduleItem.time}
                </td>
                <td className="flex flex-col gap-4 px-2 py-8 lg:py-16">
                  <span
                    className="text-xl font-bold md:text-lg"
                    dangerouslySetInnerHTML={{
                      __html: scheduleItem.titleHTML,
                    }}
                  />
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4 md:gap-5">
                    {scheduleItem.speakers?.length ? (
                      <span className="flex flex-wrap gap-2 sm:gap-3 md:gap-5">
                        {scheduleItem.speakers.map((s) => (
                          <Link
                            key={s.slug}
                            to={`../../speakers/${s.slug}`}
                            title={s.name}
                            className="flex flex-col items-center justify-center"
                          >
                            <img
                              src={s.imgSrc}
                              className="h-16 w-16 rounded-md sm:h-24 sm:w-24 md:h-32 md:w-32"
                              alt={s.name}
                              title={s.name}
                            />
                            <small className="underline">Details</small>
                          </Link>
                        ))}
                      </span>
                    ) : null}
                    <div
                      className="flex-1"
                      dangerouslySetInnerHTML={{
                        __html: scheduleItem.contentHTML,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-10">
        <small>
          The conference will be live streamed and recordings of all the talks
          will be uploaded to{" "}
          <a className="underline" href="https://rmx.as/youtube">
            YouTube
          </a>{" "}
          soon after the event.
        </small>
      </div>
      <div className="mt-20">
        <h2 className="font-display text-xl font-extrabold md:text-3xl">
          After Party
        </h2>
        <small>7:00pm - 10:00pm</small>
        <p>
          After a full day of stellar talks, relax and have fun with fellow
          Remix enthusiasts, speakers, and sponsors at our official Remix
          after-party (same venue). We are busy planning all the details to
          ensure there is a little fun for everyone to enjoy... more information
          coming soon.{" "}
        </p>
      </div>
    </div>
  );
}
