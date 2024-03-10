import path from "path";
import fs from "fs";
import tar from "tar";
import { getMenuFromStream } from "./docs";

describe("getMenuFromStream", () => {
  it("sorts the menu with children and stuff", async () => {
    let stream = await getFixtureStream();
    let menu = await getMenuFromStream(stream);

    // removes `index.md` so only 2, not 3
    expect(menu.length).toBe(2);
    expect(menu[0].attrs.title).toBe("Components");
    expect(menu[0].children.length).toBe(2);

    expect(menu[1].attrs.title).toBe("Pages");
    expect(menu[1].children.length).toBe(2);

    expect(menu[1].children.length).toBe(2);
    expect(menu[1].slug).toBe("pages");
    expect(menu[1].children[0].attrs.title).toBe("Quickstart Tutorial");
    expect(menu[1].children[0].slug).toBe("pages/tutorial");
  });
});

async function getFixtureStream(): Promise<NodeJS.ReadableStream> {
  let fixturePath = path.join(__dirname, "__fixture__");
  let writePath = path.join(fixturePath, "tar.tgz");
  await tar.c({ gzip: true, file: writePath }, [fixturePath]);
  return fs.createReadStream(writePath);
}
