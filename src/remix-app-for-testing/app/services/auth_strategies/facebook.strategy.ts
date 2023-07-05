// Refer to https://www.npmjs.com/package/remix-auth-socials for more information
import { AuthStrategies } from "~/services/auth_strategies";
import type { User } from "~/services/auth.server";
import { FacebookStrategy } from "remix-auth-socials";

const clientID = process.env.FACEBOOK_CLIENT_ID;
const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  throw new Error(
    'Missing environment variables for Facebook. Did you forget to add FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to your .env file?'
  );
}

export const facebookStrategy = new FacebookStrategy<User>({
  clientID,
  clientSecret,
  callbackURL: `${process.env.APP_URL}/auth/${AuthStrategies.FACEBOOK}/callback`,
},
async ({ profile }) => {
  // Do something with the tokens and profile
  return {};
});
