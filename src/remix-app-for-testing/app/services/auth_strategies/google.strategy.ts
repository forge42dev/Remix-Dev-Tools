// Refer to https://github.com/pbteja1998/remix-auth-google for more information
import { AuthStrategies } from "~/services/auth_strategies";
import type { User } from "~/services/auth.server";
import { GoogleStrategy } from "remix-auth-google";

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}

export const googleStrategy = new GoogleStrategy<User>({
  clientID,
  clientSecret,
  callbackURL: `${process.env.APP_URL}/auth/${AuthStrategies.GOOGLE}/callback`,
},
async ({ accessToken, refreshToken, extraParams, profile }) => {
  // Do something with the tokens and profile
  return {};
});
