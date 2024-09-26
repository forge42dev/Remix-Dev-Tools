import * as React from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import "~/styles/conf-speaker.css";
import { CACHE_CONTROL } from "~/lib/http.server";
import { getSpeakerBySlug, getConfSessions } from "~/lib/conf2023.server";
import type { Speaker, SpeakerSession } from "~/lib/conf2023";
import invariant from "tiny-invariant";

export const meta: MetaFunction<typeof loader> = (args) => {
  if (args.data) {
    const { speaker } = args.data;
    return [{ title: `${speaker.nameFull} at Remix Conf` }];
  }
  return [
    { title: "Missing Speaker" },
    { description: "There is no speaker info at this URL." },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.speakerSlug, "Missing speaker slug");
  let speakerSlug = params.speakerSlug;
  let speaker: Speaker | null;
  let allSessions: SpeakerSession[] = [];

  try {
    // Unfortunately, Sessionize doesn't have an API for fetching a single
    // speaker, so we have to fetch all of them and then filter down to the one
    // we want.
    [speaker, allSessions] = await Promise.all([
      getSpeakerBySlug(speakerSlug),
      getConfSessions(),
    ]);
  } catch (err) {
    throw json(
      {
        error:
          err && typeof err === "object" && "message" in err
            ? err.message
            : "Something went wrong",
      },
      { status: 400 },
    );
  }

  if (!speaker) {
    throw json(null, 404);
  }
  let speakerSessions = allSessions.filter((session) =>
    (session.speakers || []).some((sp) => sp.id === speaker?.id),
  );
  return json(
    {
      speaker: {
        ...speaker,
        sessions: speaker.isEmcee
          ? []
          : speakerSessions.map((session) => {
              let startsAt = session.startsAt || null;
              let endsAt = session.endsAt || null;

              let descriptionHTML: string | null = null;
              if (session.description) {
                // Quick and dirty attempt to make arbitrarily formatted line
                // breaks/lists from Sessionize not look like crap here.
                descriptionHTML = session.description
                  .split("\n")
                  .reduce((html, line, i, lines) => {
                    line = line.trim();
                    if (!line) return html;

                    let olRegExp = /^\d+\.\s/;
                    let ulRegExp = /^[-*]\s/;
                    let previousLine = lines[i - 1];
                    let nextLine = lines[i + 1];

                    if (olRegExp.test(line)) {
                      let digitless = line.replace(olRegExp, "");
                      let nextLineStart =
                        previousLine && olRegExp.test(previousLine)
                          ? "<li>"
                          : "<ol><li>";
                      let nextLineEnd =
                        nextLine && olRegExp.test(nextLine)
                          ? "</li>"
                          : "</li></ol>";
                      return (
                        html + nextLineStart + digitless.trim() + nextLineEnd
                      );
                    }

                    if (ulRegExp.test(line)) {
                      let bulletless = line.replace(ulRegExp, "");
                      let nextLineStart =
                        previousLine && ulRegExp.test(previousLine)
                          ? "<li>"
                          : "<ul><li>";
                      let nextLineEnd =
                        nextLine && ulRegExp.test(nextLine)
                          ? "</li>"
                          : "</li></ul>";
                      return (
                        html + nextLineStart + bulletless.trim() + nextLineEnd
                      );
                    }

                    return html + "<p>" + line.trim() + "</p>";
                  }, "");
              }

              return {
                ...session,
                descriptionHTML,
                startsAtISO: startsAt?.toISO() || null,
                startsAtFormatted:
                  startsAt?.toLocaleString(
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      timeZone: "America/Denver",
                    },
                    { locale: "en-US" },
                  ) || null,
                endsAtISO: endsAt?.toISO() || null,
                endsAtFormatted:
                  endsAt?.toLocaleString(
                    {
                      hour: "numeric",
                      minute: "numeric",
                      timeZone: "America/Denver",
                    },
                    { locale: "en-US" },
                  ) || null,
              };
            }),
      },
    },
    { headers: { "Cache-Control": CACHE_CONTROL.conf } },
  );
}

export default function SpeakerRoute() {
  let { speaker } = useLoaderData<typeof loader>();
  let links = new Map<string, (typeof speaker.links)[number]>();
  for (let link of speaker.links) {
    if (links.has(link.url)) continue;
    links.set(link.url, link);
  }

  return (
    <article>
      <div className="mb-10 flex flex-col gap-6 text-white sm:flex-row sm:gap-10">
        {speaker.imgUrl ? (
          <div className="sm:w-64 sm:flex-none">
            <img
              src={speaker.imgUrl}
              alt=""
              className="aspect-1 w-full max-w-full border-[1px] border-gray-600 bg-gray-800 object-contain object-center"
            />
          </div>
        ) : null}
        <div>
          <div className="mb-4 flex flex-col gap-3">
            <header>
              <h1 className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                {speaker.nameFull}
              </h1>
              <p className="text-gray-300">{speaker.tagLine}</p>
            </header>
            {links.size > 0 ? (
              <ul className="flex gap-2 text-sm sm:text-base">
                {[...links.values()].map((link) => {
                  let linkText = getLinkText(link);
                  let linkIcon = getLinkIcon(link);
                  return (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        title={linkText}
                        aria-label={linkText}
                        className="text-gray-300 hover:text-gray-50"
                      >
                        {linkIcon}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {speaker.bio ? (
            <div className="speaker-prose text-gray-200">
              {speaker.bio.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {speaker.sessions.length ? (
        <aside className="mt-10">
          <h2 className="mb-4 font-display text-base font-extrabold uppercase text-gray-300 sm:text-lg">
            {speaker.nameFirst}’s Sessions
          </h2>
          <div className="flex flex-col gap-4 sm:gap-6">
            {speaker.sessions.map((session) => {
              let startsAtISO = session.startsAtISO;
              let startsAtFormatted = session.startsAtFormatted;

              return (
                <article
                  key={session.title}
                  className="flex flex-col gap-4 border-[1px] border-gray-600 bg-gray-900 p-4 sm:p-6"
                >
                  <div>
                    <h3 className="inline font-display text-xl font-extrabold md:text-3xl">
                      {session.title}
                    </h3>
                    {startsAtISO ? (
                      <div className="text-gray-300">
                        <time dateTime={startsAtISO}>{startsAtFormatted}</time>{" "}
                      </div>
                    ) : null}
                  </div>
                  {session.descriptionHTML ? (
                    <div
                      className="speaker-prose"
                      dangerouslySetInnerHTML={{
                        __html: session.descriptionHTML,
                      }}
                    ></div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </aside>
      ) : null}
    </article>
  );
}

function getLinkIcon({ url, linkType }: { url: string; linkType?: string }) {
  url = removeTrailingSlash(url);
  if (linkType === "Twitter") {
    return <TwitterIcon />;
  }
  if (linkType === "LinkedIn") {
    return <LinkedInIcon />;
  }
  if (linkType === "Company_Website") {
    return <CompanyIcon />;
  }
  return <GlobeIcon />;
}

function getLinkText({ url, linkType }: { url: string; linkType?: string }) {
  url = removeTrailingSlash(url);
  if (linkType === "Twitter") {
    let handle = url.split("/").pop();
    return handle ? "Twitter: @" + handle : "Twitter";
  }
  if (linkType === "LinkedIn") {
    let handle = url.split("/").pop();
    return handle ? "LinkedIn: " + handle : "LinkedIn";
  }
  return url;
}

function removeTrailingSlash(str: string) {
  return str.replace(/\/$/, "");
}

function TwitterIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 36 36"
      fill="currentColor"
      className="h-6 w-6"
      {...props}
    >
      <path d="M32.1,9.2c-1,0.5-2.2,0.8-3.3,0.9C30,9.4,30.9,8.3,31.3,7c-1.1,0.7-2.4,1.1-3.7,1.4c-1.1-1.1-2.6-1.8-4.2-1.8  c-3.2,0-5.8,2.6-5.8,5.8c0,0.5,0.1,0.9,0.1,1.3C13,13.4,8.7,11.1,5.9,7.6c-0.5,0.9-0.8,1.8-0.8,2.9c0,2,1,3.8,2.6,4.8  c-0.9,0-1.8-0.3-2.6-0.7c0,0,0,0,0,0.1c0,2.8,2,5.1,4.6,5.7c-0.5,0.1-1,0.2-1.5,0.2c-0.4,0-0.7,0-1.1-0.1c0.7,2.3,2.9,4,5.4,4  c-2,1.6-4.5,2.5-7.2,2.5c-0.5,0-0.9,0-1.4-0.1c2.6,1.6,5.6,2.6,8.9,2.6c10.7,0,16.5-8.8,16.5-16.5c0-0.3,0-0.5,0-0.7  C30.4,11.4,31.3,10.4,32.1,9.2z" />
    </svg>
  );
}

function LinkedInIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 36 36"
      fill="currentColor"
      className="h-6 w-6"
      {...props}
    >
      <path d="M10.3,3.6c0,2-1.6,3.6-3.6,3.6c-2,0-3.6-1.6-3.6-3.6c0-2,1.6-3.6,3.6-3.6C8.7,0,10.3,1.6,10.3,3.6z M3.6,9.9h6.2v19.9H3.6  V9.9z M32.9,18.9v10.9h-6.2v-9.7c0-2.3,0-5.3-3.2-5.3c-3.2,0-3.7,2.5-3.7,5.1v9.8h-6.2V9.9h5.9v2.7h0.1c0.8-1.6,2.8-3.2,5.8-3.2  C31.8,9.4,32.9,13.5,32.9,18.9z" />
    </svg>
  );
}

function CompanyIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0112 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 00-6 0v-.09a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5zm-3 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
        clipRule="evenodd"
      />
      <path d="M3 18.4v-2.796a4.3 4.3 0 00.713.31A26.226 26.226 0 0012 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 01-6.477-.427C4.047 21.128 3 19.852 3 18.4z" />
    </svg>
  );
}

function GlobeIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      {...props}
    >
      <path d="M15.75 8.25a.75.75 0 01.75.75c0 1.12-.492 2.126-1.27 2.812a.75.75 0 11-.992-1.124A2.243 2.243 0 0015 9a.75.75 0 01.75-.75z" />
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM4.575 15.6a8.25 8.25 0 009.348 4.425 1.966 1.966 0 00-1.84-1.275.983.983 0 01-.97-.822l-.073-.437c-.094-.565.25-1.11.8-1.267l.99-.282c.427-.123.783-.418.982-.816l.036-.073a1.453 1.453 0 012.328-.377L16.5 15h.628a2.25 2.25 0 011.983 1.186 8.25 8.25 0 00-6.345-12.4c.044.262.18.503.389.676l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.575 15.6z"
        clipRule="evenodd"
      />
    </svg>
  );
}
