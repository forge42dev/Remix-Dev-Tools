import gunzip from "gunzip-maybe";
import tar from "tar-stream";

type ProcessFile = ({
  filename,
  content,
}: {
  filename: string;
  content: string;
}) => Promise<void>;

export function createTarFileProcessor(
  stream: NodeJS.ReadableStream,
  pattern: RegExp = /docs\/(.+)\.md$/,
) {
  return (processFile: ProcessFile) =>
    processFilesFromRepoTarball(stream, pattern, processFile);
}

async function processFilesFromRepoTarball(
  stream: NodeJS.ReadableStream,
  pattern: RegExp = /docs\/(.+)\.md$/,
  processFile: ProcessFile,
): Promise<void> {
  return new Promise((accept, reject) => {
    stream
      .pipe(gunzip())
      .pipe(tar.extract())
      .on("entry", async (header, stream, next) => {
        // Make sure the file matches the ones we want to process
        let isMatch = header.type === "file" && pattern.test(header.name);
        if (isMatch) {
          // remove "react-router-main" and "remix-v1.0.0" from the full name
          // that's something like "remix-main/docs/index.md"
          let filename = removeRepoRefName(header.name);
          // buffer the contents of this file stream so we can send the entire
          // string to be processed by the caller
          let content = await bufferStream(stream);
          await processFile({ filename, content });
          next();
        } else {
          // ignore this entry
          stream.resume();
          stream.on("end", next);
        }
      })
      .on("error", reject)
      .on("finish", accept);
  });
}

function removeRepoRefName(headerName: string): string {
  return headerName.replace(/^.+?[/]/, "");
}

async function bufferStream(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((accept, reject) => {
    let chunks: Uint8Array[] = [];
    stream
      .on("error", reject)
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => accept(Buffer.concat(chunks).toString()));
  });
}
