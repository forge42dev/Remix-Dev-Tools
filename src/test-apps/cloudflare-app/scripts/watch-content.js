// the `entry.server.tsx` file requires app/refresh.ignored.js
// so if we change our content then update app/refresh.ignored.js we'll
// get an auto-refresh even though content isn't directly required in our app.
import chokidar from "chokidar";
import child_process from "node:child_process";
import * as fs from "node:fs";
import path from "node:path";
import util from "node:util";
const exec = util.promisify(child_process.exec);

(function checkLocalKvStore() {
  const exists = fs.existsSync("./.mf/kv/CONTENT/blog");

  // We have files in local kv so return early
  if (exists && fs.readdirSync("./.mf/kv/CONTENT/blog") > 0) return;

  fs.readdirSync("./content/blog").forEach(async (file) => {
    const filePath = `content/blog/${file}`;
    const command = `node scripts/mdx/compile-mdx.js --json --file ${filePath}`;

    await exec(command).catch((e) => {
      console.error(e);
    });
  });
})();

const refreshFilePath = "./app/.refresh.ignore";
let refreshTimeout = undefined;

chokidar.watch(path.join("./content")).on("change", async (updatedFile) => {
  console.log("changed", updatedFile);
  const command = `node scripts/mdx/compile-mdx.js --json --file ${updatedFile}`;
  const lastModified = Math.floor(fs.statSync(updatedFile).mtimeMs);

  // reset existing timer so we don't build multiple times
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = undefined;
  }

  await exec(command).catch((e) => {
    console.error(e);
  });

  refreshTimeout = setTimeout(() => {
    // update refresh file to trigger rebuild/refresh
    fs.writeFileSync(refreshFilePath, String(lastModified), "utf8");
    refreshTimeout = undefined;
  }, 500);
});
