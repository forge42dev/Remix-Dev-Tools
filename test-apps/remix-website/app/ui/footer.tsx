import { Discord, GitHub, Twitter, YouTube } from "./icons";
import { Wordmark } from "./logo";

export function Footer({
  forceDark,
  className = "",
}: {
  forceDark?: boolean;
  className?: string;
}) {
  return (
    <footer
      x-comp="Footer"
      className={
        "flex items-center justify-between px-6 py-9 text-base lg:px-12" +
        " " +
        (forceDark ? "text-white " : "text-black dark:text-white ") +
        className
      }
    >
      <div className="flex items-center">
        <Wordmark height={16} aria-label="Remix logo" role="img" />
      </div>
      <nav
        className={
          "flex gap-6 " +
          (forceDark ? "text-white" : "text-black dark:text-white")
        }
        aria-label="Find us on the web"
      >
        <a href="https://github.com/remix-run" aria-label="GitHub">
          <GitHub aria-hidden />
        </a>
        <a href="https://twitter.com/remix_run" aria-label="Twitter">
          <Twitter aria-hidden />
        </a>
        <a href="https://youtube.com/remix_run" aria-label="YouTube">
          <YouTube aria-hidden />
        </a>
        <a href="https://rmx.as/discord" aria-label="Remix">
          <Discord aria-hidden />
        </a>
      </nav>
    </footer>
  );
}
