import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import url from "node:url";
import { type ServerBuild, broadcastDevReady, installGlobals } from "@remix-run/node";
import { type RequestHandler, createRequestHandler } from "@remix-run/express";
import chokidar from "chokidar";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";
import getPort from "get-port";
import { withServerDevTools } from "./init.js";
import chalk from "chalk";
if (process.env.NODE_ENV === "production") {
  throw new Error("You can't use Remix Dev Tools server in production mode!");
}

sourceMapSupport.install();
installGlobals();

function parseNumber(raw?: string) {
  if (raw === undefined) return undefined;
  let maybe = Number(raw);
  if (Number.isNaN(maybe)) return undefined;
  return maybe;
}

export async function run() {
  let port = parseNumber(process.env.PORT) ?? (await getPort({ port: 3000 }));

  let buildPathArg = process.argv[2];

  if (!buildPathArg) {
    console.error(`
  Usage: rdt-serve <server-build-path> - e.g. rdt-serve build/index.js`);
    process.exit(1);
  }

  let buildPath = path.resolve(buildPathArg);
  let versionPath = path.resolve(buildPathArg, "..", "version.txt");
  async function reimportServer() {
    // Kill ESM cache
    let stat = fs.statSync(buildPath);
    // Kill CJS cache
    if (require) {
      Object.keys(require.cache).forEach((key) => {
        if (key.startsWith(buildPath)) {
          delete require.cache[key];
        }
      });
    }
    // use a timestamp query parameter to bust the import cache
    const build = await import(url.pathToFileURL(buildPath).href + "?t=" + stat.mtimeMs);
    return build;
  }

  function createDevRequestHandler(initialBuild: ServerBuild): RequestHandler {
    let build = withServerDevTools(initialBuild);
    async function handleServerUpdate() {
      // 1. re-import the server build
      build = await reimportServer();
      build = withServerDevTools(build);
      // 2. tell Remix that this app server is now up-to-date and ready
      broadcastDevReady(build);
    }

    chokidar.watch(versionPath, { ignoreInitial: true }).on("add", handleServerUpdate).on("change", handleServerUpdate);

    // wrap request handler to make sure its recreated with the latest build for every request
    return async (req, res, next) => {
      try {
        return createRequestHandler({
          build,
          mode: "development",
        })(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  let build: ServerBuild = await reimportServer();

  let onListen = () => {
    let address =
      process.env.HOST ||
      Object.values(os.networkInterfaces())
        .flat()
        .find((ip) => String(ip?.family).includes("4") && !ip?.internal)?.address;

    if (!address) {
      console.log(`${chalk.green.bold("[rdt-serve]")} started on http://localhost:${port}`);
    } else {
      console.log(`${chalk.green.bold("[rdt-serve]")} started on http://localhost:${port} (http://${address}:${port})`);
    }

    void broadcastDevReady(build);
  };

  let app = express();
  app.disable("x-powered-by");
  app.use(compression());
  app.use(
    build.publicPath,
    express.static(build.assetsBuildDirectory, {
      immutable: true,
      maxAge: "1y",
    })
  );
  app.use(express.static("public", { maxAge: "1h" }));
  app.use(morgan("tiny"));

  app.all("*", createDevRequestHandler(build));

  let server = app.listen(port, onListen);

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.once(signal, () => server?.close(console.error));
  });
}
