import type { MetaFunction } from "@remix-run/cloudflare";

import { Icon } from "~/components/icon";
import atticusAndMe from "~/images/atticus-and-me.png";

export const meta: MetaFunction = () => {
  return [
    { title: "ItsAydrian.com" },
    { content: "Welcome to ItsAydrian.com!", name: "description" }
  ];
};

export default function Index() {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center gap-4 bg-gradient-to-r from-cyan-500 to-green-500 text-white md:flex-row-reverse md:justify-center md:gap-0">
      <img
        alt="Atticus and Me"
        className="w-full md:max-h-screen md:w-auto"
        src={atticusAndMe}
      />
      <div className="flex h-full max-w-xl flex-col items-center justify-center rounded-lg bg-blue-950 bg-opacity-75 px-12 py-6 shadow md:mx-auto md:grow">
        <div className="flex h-full grow flex-col justify-center gap-1.5">
          <h1 className="max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-center text-4xl font-bold leading-tight text-transparent md:text-6xl">
            It's Aydrian
          </h1>
          <h2 className="text-center text-2xl font-semibold leading-tight md:text-4xl">
            Hoosier in the Big City
          </h2>
          <h3 className="max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text font-bold leading-tight text-transparent md:text-xl">
            Corgi Dad · Uncle · Nerd
          </h3>
        </div>
        <ul className="flex w-full flex-col items-center gap-4 p-6 text-lg font-medium md:flex-row md:justify-center md:p-12">
          <li className="flex items-center gap-2">
            <a
              className="hover:animate-bounce hover:text-green-500"
              href="https://twitter.com/itsaydrian"
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="h-6 w-6" name="twitter" />
            </a>
            <a
              className="hover:animate-bounce hover:text-green-500"
              href="https://instagram.com/itsaydrian"
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="h-6 w-6" name="instagram" />
            </a>
            <a
              className="hover:animate-bounce hover:text-green-500"
              href="https://twitch.tv/itsaydrian"
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="h-6 w-6" name="twitch" />
            </a>
            <span>itsaydrian</span>
          </li>
          <li className="flex items-center gap-2">
            <a
              className="hover:animate-bounce hover:text-green-500"
              href="https://github.com/aydrian"
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="h-6 w-6" name="github" />
            </a>
            <span>aydrian</span>
          </li>
          <li className="flex items-center gap-2">
            <a
              className="hover:animate-bounce hover:text-green-500"
              href="https://itsaydrian.com"
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="h-6 w-6" name="home" />
            </a>
            <span>itsaydrian.com</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
