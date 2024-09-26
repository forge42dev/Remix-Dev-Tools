import { type LoaderFunctionArgs } from "@remix-run/node";
import svg2img from "svg2img";
import { createOgImageSVG } from "./utils.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const svg = await createOgImageSVG(request);

  const { data, error } = await new Promise(
    (
      resolve: (value: { data: Buffer | null; error: Error | null }) => void,
    ) => {
      svg2img(svg, (error, buffer) => {
        if (error) {
          resolve({ data: null, error });
        } else {
          resolve({ data: buffer, error: null });
        }
      });
    },
  );
  if (error) {
    return new Response(error.toString(), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
  return new Response(data, {
    headers: {
      "Content-Type": "image/png",
      // starting with 1 day, may need to be longer as these images don't change often
      // could also make it dependent on the date of the post
      "Cache-Control": `max-age=${60 * 60 * 24}`,
    },
  });
}
