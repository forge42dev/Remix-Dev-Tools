import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = context.env as Env;
  try {
    const key = request.headers.get("Authorization");
    if (key !== `Bearer ${env.POST_API_KEY}`) {
      return new Response(`Unauthorized ${key}`, { status: 401 });
    }
    const data = (await request.json()) as any;
    const blurDataUrl = await getBlurDataUrl(data.frontmatter.image.url);
    data.frontmatter.image["blurDataUrl"] = blurDataUrl;

    await env.CONTENT.put(data.slug, JSON.stringify(data));
    return json({ success: true });
  } catch (e) {
    if (e instanceof Error) {
      return json({ message: e.message, stack: e.stack });
    }
  }
};

async function getBlurDataUrl(url: string) {
  const imageUrl = `https://itsaydrian.com/cdn-cgi/image/fit=cover,blur=100,width=900/${url}`;
  const res = await fetch(imageUrl);

  const arrayBuffer = await res.arrayBuffer();
  const base64 = base64Encode(arrayBuffer);
  const mime = res.headers.get("Content-Type") ?? "image/webp";
  return `data:${mime};base64,${base64}`;
}

function base64Encode(buf: ArrayBuffer) {
  let string = "";
  new Uint8Array(buf).forEach((byte) => {
    string += String.fromCharCode(byte);
  });

  return btoa(string);
}
