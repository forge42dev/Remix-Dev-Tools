import fs from "fs";
import { join } from "path";

import { IncomingMessage, ServerResponse } from "http";
import { Connect } from "vite";

export function processPlugins(pluginDirectoryPath: string) {
  const files = fs.readdirSync(pluginDirectoryPath);
  const allExports: { name: string; path: string }[] = [];
  files.forEach((file) => {
    const filePath = join(pluginDirectoryPath, file);
    const fileCode = fs.readFileSync(filePath, "utf8");
    const lines = fileCode.split("\n");
    lines.forEach((line) => {
      if (line.includes("export const")) {
        const [name] = line.split("export const ")[1].split(" =");
        allExports.push({ name, path: join("..", filePath).replaceAll("\\", "/") });
      }
    });
  });
  return allExports;
}

export const handleDevToolsViteRequest = (
  req: Connect.IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  next: Connect.NextFunction,
  cb: (data: any) => void
) => {
  if (!req.url?.includes("remix-dev-tools")) {
    return next();
  }

  const chunks: any[] = [];
  req.on("data", (chunk) => {
    chunks.push(chunk);
  });
  req.on("end", () => {
    const dataToParse = Buffer.concat(chunks);
    const parsedData = JSON.parse(dataToParse.toString());
    cb(parsedData);
    res.write("OK");
  });
};
