import express from "express";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createRequestHandler } from "@remix-run/express";
import sourceMapSupport from "source-map-support";
import { installGlobals } from "@remix-run/node";

sourceMapSupport.install();
installGlobals();

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const app = express();

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("trust proxy", true);
app.use(limiter);

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  createRequestHandler({
    build: viteDevServer
      ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
      : await import("./build/server/index.js"),
    mode: process.env.NODE_ENV,
  }),
);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `Express server listening on port ${port} (http://localhost:${port})`,
  );
});
