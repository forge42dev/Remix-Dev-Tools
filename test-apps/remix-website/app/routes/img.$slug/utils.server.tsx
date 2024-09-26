import { json } from "@remix-run/node";
import getEmojiRegex from "emoji-regex";
import satori from "satori";
import interFont from "./inter-roman-latin-var.woff?arraybuffer";
import socialBackground from "./social-background.png?arraybuffer";

// Big thanks goes to Jacob Paris' blog outlining how to set this up
// https://www.jacobparis.com/content/remix-og

let primaryTextColor = "#ffffff";
let secondaryTextColor = "#d0d0d0";

let primaryFont = "Inter";
let titleFont = "Inter";

export async function createOgImageSVG(request: Request) {
  let requestUrl = new URL(request.url);
  let searchParams = new URLSearchParams(requestUrl.search);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  let { title, displayDate, authors } = getDataFromParams(
    siteUrl,
    searchParams,
  );

  return satori(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        fontFamily: primaryFont,
        backgroundImage: `url("data:image/png;base64,${arrayBufferToBase64(socialBackground)}")`,
        padding: "125px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1800,
          marginLeft: 144,
        }}
      >
        <p
          style={{
            fontSize: 50,
            color: secondaryTextColor,
            margin: 0,
          }}
        >
          {displayDate}
        </p>
        <h1
          style={{
            fontFamily: titleFont,
            fontWeight: 900,
            color: primaryTextColor,
            fontSize: 144,
            margin: 0,
            marginTop: 32,
          }}
        >
          {title}
        </h1>
      </div>

      <Authors authors={authors} />
    </div>,
    {
      width: 2400,
      height: 1256,
      // Unfortunately satori doesn't support WOFF2 so we have to have a woff version
      fonts: [
        {
          name: titleFont,
          data: interFont,
        },
        {
          name: primaryFont,
          data: interFont,
        },
      ],
    },
  );
}

// Taken from https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function stripEmojis(string: string): string {
  return string.replace(getEmojiRegex(), "").replace(/\s+/g, " ").trim();
}

function getAuthorImgSrc(siteUrl: string, name: string) {
  let authorNameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");

  return `${siteUrl}/authors/profile-${authorNameSlug}.png`;
}

/**
 * Extracts the data needed for the og image from the params. Throws a 400 error if
 * any anything is wrong
 */
function getDataFromParams(siteUrl: string, searchParams: URLSearchParams) {
  let title = searchParams.get("title");
  let displayDate = searchParams.get("date");

  let authorNames = searchParams.getAll("authorName");
  let authorTitles = searchParams.getAll("authorTitle");

  if (
    !title ||
    !displayDate ||
    authorNames.length === 0 ||
    authorTitles.length === 0
  ) {
    throw json({ error: "Missing required params" }, 400);
  }

  if (authorNames.length !== authorTitles.length) {
    throw json(
      { error: "Number of authorNames must match number of authorTitles" },
      400,
    );
  }

  let authors = authorNames.map((name, i) => ({
    name,
    title: authorTitles[i],
    imgSrc: getAuthorImgSrc(siteUrl, name),
  }));

  return {
    title: stripEmojis(title),
    displayDate: stripEmojis(displayDate),
    authors,
  };
}

function Authors({
  authors,
}: {
  authors: ReturnType<typeof getDataFromParams>["authors"];
}) {
  // We will have problems if we have more than 2 authors
  const picDimensions = authors.length * -60 + 380;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {authors.map(({ name, title, imgSrc }) => (
        <div
          style={{
            display: "flex",
            width: 1600,
            marginLeft: 144,
            alignItems: "center",
          }}
          key={name + title}
        >
          <img
            width={picDimensions}
            height={picDimensions}
            // No alt needed, this is all turning into an image
            alt=""
            src={imgSrc}
            style={{
              marginLeft: -40,
              borderRadius: 9999,
            }}
          />
          <h2
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 30,
            }}
          >
            <span
              style={{
                fontFamily: primaryFont,
                color: primaryTextColor,
                fontSize: 70,
                margin: 0,
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontFamily: primaryFont,
                color: secondaryTextColor,
                fontSize: 40,
                margin: 0,
              }}
            >
              {title}
            </span>
          </h2>
        </div>
      ))}
    </div>
  );
}
