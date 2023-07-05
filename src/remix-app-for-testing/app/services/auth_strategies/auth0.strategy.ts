// Refer to https://github.com/danestves/remix-auth-auth0 for more information
import { AuthStrategies } from "~/services/auth_strategies";
import type { User } from "~/services/auth.server";
import { Auth0Strategy } from "remix-auth-auth0";

const clientID = process.env.AUTH0_CLIENT_ID;
const clientSecret = process.env.AUTH0_CLIENT_SECRET;
const domain = process.env.AUTH0_DOMAIN;

if (!clientID || !clientSecret || !domain) {
  throw new Error(
    "Missing environment variables for Auth0. Did you forget to add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, and AUTH0_DOMAIN to your .env file?"
  );
}

export const auth0Strategy  = new Auth0Strategy<User>({
  clientID,
  clientSecret,
  domain,
  callbackURL: `${process.env.APP_URL}/auth/${AuthStrategies.AUTH0}/callback`
},
async ({ accessToken, refreshToken, profile, extraParams }) => {
  // Do something with the tokens and profile
  return {};
});
