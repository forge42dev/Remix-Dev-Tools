import fs from "fs";
import path from "path";
import { createTarFileProcessor } from "./tarball.server";

describe("createTarFileProcessor", () => {
  it("extracts and processes files one-by-one", async () => {
    let fixturePath = path.join(process.cwd(), "test/fixture.tar.gz");
    let stream = fs.createReadStream(fixturePath);

    let processFiles = createTarFileProcessor(stream);
    let docs: string[] = [];
    await processFiles(async ({ filename }) => {
      docs.push(filename);
    });

    expect(docs).toMatchInlineSnapshot(`
      [
        "docs/api.md",
        "docs/contributing.md",
        "docs/faq.md",
        "docs/getting-started/concepts.md",
        "docs/getting-started/index.md",
        "docs/getting-started/installation.md",
        "docs/getting-started/overview.md",
        "docs/getting-started/tutorial.md",
        "docs/guides/index.md",
        "docs/guides/ssr.md",
        "docs/guides/testing.md",
        "docs/index.md",
        "docs/upgrading/index.md",
        "docs/upgrading/reach.md",
        "docs/upgrading/v5.md",
      ]
    `);
  });
});
