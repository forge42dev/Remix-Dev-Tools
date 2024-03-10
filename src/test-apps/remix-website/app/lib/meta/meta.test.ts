import { getMeta } from "./meta";

describe("getMeta", () => {
  describe("default", () => {
    it("return basic site info without siteUrl&image", () => {
      expect(
        getMeta({
          title: "Remix",
          description: "Some description.",
        }),
      ).toStrictEqual([
        { title: "Remix" },
        { name: "description", content: "Some description." },
        { property: "og:title", content: "Remix" },
        { property: "og:description", content: "Some description." },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:creator", content: "@remix_run" },
        { name: "twitter:site", content: "@remix_run" },
        { name: "twitter:title", content: "Remix" },
        { name: "twitter:description", content: "Some description." },
      ]);
    });
  });

  describe("with siteUrl and image", () => {
    it("return basic site info", () => {
      expect(
        getMeta({
          title: "Remix",
          description: "Some description.",
          siteUrl: "https://remix.run",
          image: "https://remix.run/img/og.1.jpg",
        }),
      ).toStrictEqual([
        { title: "Remix" },
        { name: "description", content: "Some description." },
        { property: "og:url", content: "https://remix.run" },
        { property: "og:title", content: "Remix" },
        { property: "og:description", content: "Some description." },
        { property: "og:image", content: "https://remix.run/img/og.1.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:creator", content: "@remix_run" },
        { name: "twitter:site", content: "@remix_run" },
        { name: "twitter:title", content: "Remix" },
        { name: "twitter:description", content: "Some description." },
        { name: "twitter:image", content: "https://remix.run/img/og.1.jpg" },
      ]);
    });
  });

  describe("with additionalMeta", () => {
    it("plus basic info, return additional meta data", () => {
      expect(
        getMeta({
          title: "Remix",
          description: "Some description.",
          additionalMeta: [
            { name: "robots", content: "index, follow" },
            { name: "author", content: "Remix" },
            { name: "keyword", content: undefined },
          ],
        }),
      ).toStrictEqual([
        { title: "Remix" },
        { name: "description", content: "Some description." },
        { property: "og:title", content: "Remix" },
        { property: "og:description", content: "Some description." },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:creator", content: "@remix_run" },
        { name: "twitter:site", content: "@remix_run" },
        { name: "twitter:title", content: "Remix" },
        { name: "twitter:description", content: "Some description." },
        { name: "robots", content: "index, follow" },
        { name: "author", content: "Remix" },
      ]);
    });
  });
});
