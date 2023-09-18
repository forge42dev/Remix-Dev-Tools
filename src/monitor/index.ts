import { DataFunctionArgs } from "@remix-run/server-runtime";

export class Measurer {
  measures = new Set<{
    name: string;
    duration: number;
  }>();

  async time<Result>(name: string, fn: () => Promise<Result>): Promise<Result> {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - start;
      this.measures.add({ name, duration });
    }
  }

  async toData() {
    return [...this.measures];
  }
  async toHeaders(headers = new Headers()) {
    for (const { name, duration } of this.measures) {
      headers.append("Server-Timing", `${name};dur=${duration}`);
    }
    return headers;
  }
}

export const measure = async <T extends unknown>(args: DataFunctionArgs, loader: (args: DataFunctionArgs) => T) => {
  const { request } = args;
  console.log("hello!");
  // If production don't do anything
  //if (process.env.NODE_ENV !== "development") {
  //   return loader({
  //     ...args,
  //     context: { ...args.context, time: async (name: string, fn: (...args: any[]) => any) => await fn() },
  //  });
  // }

  const measurer = new Measurer();
  try {
    const url = new URL(request.url);
    const headers = new Headers(request.headers);
    const possibleDevTools = headers.get("remix-dev-tools");

    const remixDevTools: any = {
      //method: request.method,
      from: request.headers.get("Referer"),
      path: url.pathname,
      to: request.url,
    };

    const res = await measurer.time(
      `Total Request Time `,
      //#${remixDevTools.method === "GET" ? "loader" : "action"},
      async () => {
        const response = await loader({
          ...args,
          context: { ...args.context, time: measurer.time.bind(measurer) },
        });
        return response;
      }
    );

    const timers = await measurer.toData();
    remixDevTools["timers"] = timers;
    const isResponse = res instanceof Response;

    if (!isResponse) {
      if (typeof res === "object") {
        const body = { ...res, remixDevTools };

        return body;
      }

      return res as T;
    }
    try {
      const newRes = res.clone();
      const data = await newRes.json();

      const newHeaders = new Headers(newRes.headers);
      newHeaders.append("remix-dev-tools", JSON.stringify(remixDevTools));
      await measurer.toHeaders(newHeaders);
      const body = JSON.stringify({
        ...data,
        remixDevTools,
      });

      const augmented = new Response(body, { ...newRes, headers: newHeaders });

      return augmented as T;
    } catch (e) {
      console.log(e);
    }

    await measurer.toHeaders(res.headers);
    return res as T;
  } catch (error) {
    throw error;
  }
};