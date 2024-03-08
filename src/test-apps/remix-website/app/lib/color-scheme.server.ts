import { createCookie } from "@remix-run/node";
import type { ColorScheme } from "./color-scheme";

let cookie = createCookie("color-scheme", {
  maxAge: 34560000,
  sameSite: "lax",
});

export async function parseColorScheme(request: Request) {
  const header = request.headers.get("Cookie");
  const vals = await cookie.parse(header);

  let colorScheme = vals?.colorScheme;
  if (validateColorScheme(colorScheme)) {
    // not sure why type narrowing isn't working here
    return colorScheme;
  }
  return "system";
}

export function serializeColorScheme(colorScheme: ColorScheme) {
  let eatCookie = colorScheme === "system";
  if (eatCookie) {
    return cookie.serialize({}, { expires: new Date(0), maxAge: 0 });
  } else {
    return cookie.serialize({ colorScheme });
  }
}

export function validateColorScheme(formValue: any): formValue is ColorScheme {
  return (
    formValue === "dark" || formValue === "light" || formValue === "system"
  );
}
