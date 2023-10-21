// try to keep this dep-free so we don't have to install deps
import { readdirSync, statSync } from "fs";
import { join } from "path";

import { fetchJson, getChangedFiles } from "./get-changed-files";

const [currentCommitSha] = process.argv.slice(2);

async function go() {
  const buildInfo = await fetchJson(
    "https://itsaydrian.com/api/get-content-sha"
  );

  const compareCommitSha = buildInfo.commit.sha;

  let changedFiles = [];

  if (compareCommitSha) {
    changedFiles =
      (await getChangedFiles(currentCommitSha, compareCommitSha)) ?? [];

    console.error("Determining whether the changed files are content", {
      changedFiles,
      compareCommitSha,
      currentCommitSha
    });
  } else {
    // get initial content list
    const filelist = [];
    function walk(dir) {
      const files = readdirSync(dir);
      files.forEach((file) => {
        const filePath = join(dir, file);
        if (statSync(filePath).isDirectory()) {
          walk(filePath);
        } else {
          filelist.push(filePath);
        }
      });
    }
    walk("./content");
    changedFiles = filelist.map((filename) => ({
      changeType: "added",
      filename
    }));
  }

  // get list of files that are content
  const contentFiles = changedFiles
    .filter(({ filename }) => filename.startsWith("content"))
    .map(({ filename }) => {
      let contentFile = filename;

      // make sure index.mdx file gets recompiled if component has changed
      const parts = filename.split("/");
      if (!filename.endsWith(".mdx") || filename.endsWith("/index.mdx")) {
        contentFile = parts.slice(0, parts.length - 1).join("/");
      }

      return contentFile;
    });

  console.log(Array.from(new Set(contentFiles)).filter(Boolean).join(" "));
}

go().catch((e) => {
  console.error(e);
  console.log("");
});
