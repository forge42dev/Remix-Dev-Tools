import { logDevReady } from "@remix-run/cloudflare";
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

let devBuild = build;

if (process.env.NODE_ENV === "development") {
  const { withServerDevTools } = await import("remix-development-tools/server");
  devBuild = withServerDevTools(devBuild);
  logDevReady(devBuild);
}

export const onRequest = createPagesFunctionHandler({
 build: devBuild,
  getLoadContext: (context) => ({ env: context.env }),
  mode: build.mode
});
