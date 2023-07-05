export class Measurer {
  measures = new Set<{
    name: string;
    duration: number;
  }>();

  async time<Result>(name: string, fn: () => Promise<Result>): Promise<Result> {
    let start = Date.now();
    try {
      return await fn();
    } finally {
      let duration = Date.now() - start;
      this.measures.add({ name, duration });
    }
  }

  async toData() {
    return [...this.measures];
  }
  async toHeaders(headers = new Headers()) {
    //console.log(this.measures);
    for (let { name, duration } of this.measures) {
      headers.append("Server-Timing", `${name};dur=${duration}`);
    }
    return headers;
  }
}

export const monitor = async <T extends unknown>(
  request: Request,
  handler: ({}: { time: Measurer["time"] }) => T
) => {
  const measurer = new Measurer();
  try {
    const url = new URL(request.url);
    const headers = new Headers(request.headers);
    const possibleDevTools = headers.get("remix-dev-tools");

    let remixDevTools: any = {
      method: request.method,
      from: request.headers.get("Referer"),
      path: url.pathname,
      to: request.url,
    };

    const res = await measurer.time(
      `${remixDevTools.path} - ${
        remixDevTools.method === "GET" ? "loader" : "action"
      }`,
      async () => {
        const response = await handler({
          time: measurer.time.bind(measurer),
        });
        return response as Response;
      }
    );
    //console.log(request.headers.get("Accept"));

    const clone = res.clone();
    const data = await clone.json();
    const timers = await measurer.toData();
    remixDevTools["timers"] = timers;
    const newHeaders = new Headers(res.headers);
    newHeaders.append("remix-dev-tools", JSON.stringify(remixDevTools));
    const augmented = new Response(
      JSON.stringify({
        ...data,
        remixDevTools: {
          ...remixDevTools,
          timers,
        },
      }),
      { ...res, headers: newHeaders }
    );

    console.log(timers);
    return augmented as T;
    return res as T;
  } catch (error) {
    throw error;
  }
};
