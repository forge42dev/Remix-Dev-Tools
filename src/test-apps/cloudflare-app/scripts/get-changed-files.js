// try to keep this dep-free so we don't have to install deps
import { execSync } from "child_process";
import { get } from "https";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      let data = "";
      res.on("data", (d) => {
        data += d;
      });

      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", (e) => {
      reject(e);
    });
  });
}

const changeTypes = {
  A: "added",
  D: "deleted",
  M: "modified",
  R: "moved"
};

async function getChangedFiles(currentCommitSha, compareCommitSha) {
  try {
    const lineParser = /^(?<change>\w).*?\s+(?<filename>.+$)/;
    const gitOutput = execSync(
      `git diff --name-status ${currentCommitSha} ${compareCommitSha}`
    ).toString();
    const changedFiles = gitOutput
      .split("\n")
      .map((line) => line.match(lineParser)?.groups)
      .filter(Boolean);
    const changes = [];
    for (const { change, filename } of changedFiles) {
      const changeType = changeTypes[change];
      if (changeType) {
        changes.push({ changeType: changeTypes[change], filename });
      } else {
        console.error(`Unknown change type: ${change} ${filename}`);
      }
    }
    return changes;
  } catch (error) {
    console.error(`Something went wrong trying to get changed files.`, error);
    return null;
  }
}

export default { fetchJson, getChangedFiles };
