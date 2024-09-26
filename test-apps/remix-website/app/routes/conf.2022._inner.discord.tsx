import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { primaryButtonLinkClass } from "~/ui/buttons";
import { Discord } from "~/ui/icons";
import { metaV1 } from "@remix-run/v1-meta";

export const meta: MetaFunction = (args) => {
  return metaV1(args, {
    title: "Remix Conf Discord Server",
    description: "Much of our coordination happens on Discord.",
  });
};

const channels = [
  {
    name: "conf",
    link: "https://discord.gg/WVUDqPVH8d",
    description: "General chat for the conference happens here. Say hi!",
  },
  {
    name: "conf-activities",
    link: "https://discord.gg/76RmFyD3Gq",
    description: (
      <>
        Coordinating the{" "}
        <Link className="underline" to="../schedule/may-26">
          post-conf activities
        </Link>{" "}
        happens here.
      </>
    ),
  },
];

export default function Speak() {
  return (
    <div>
      <h1 className="mb-16 font-display text-3xl font-extrabold text-white sm:text-5xl xl:text-7xl">
        <a href="https://rmx.as/discord" className="flex items-center gap-4">
          <Discord />
          <span>Remix Conf Discord</span>
        </a>
      </h1>
      <div className="container flex flex-col gap-4 text-lg text-white lg:text-xl">
        <p>
          <a href="https://rmx.as/discord" className="underline">
            The Remix Discord server
          </a>{" "}
          will be used throughout the conference to keep you up-to-date on
          what's going on with the conference (in addition to it being just a
          cool place to hang out and talk about building awesome web
          experiences).
        </p>
        <ul className="list-inside list-disc">
          {channels.map(({ name, link, description }) => (
            <li key={name}>
              <a className="underline" href={link}>
                #{name}
              </a>
              : {description}
            </li>
          ))}
        </ul>
        <p className="pt-4">Chat it up during the conference!</p>
        <div className="mt-6 w-full text-center">
          <a
            href="https://rmx.as/discord"
            className={`${primaryButtonLinkClass} flex items-center gap-4 font-display uppercase`}
          >
            <Discord /> Join the Discord
          </a>
        </div>
      </div>
    </div>
  );
}
