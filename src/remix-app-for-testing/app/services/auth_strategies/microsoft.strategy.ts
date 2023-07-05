// Refer to https://www.npmjs.com/package/remix-auth-socials for more information
import { AuthStrategies } from "~/services/auth_strategies";
import type { User } from "~/services/auth.server";
import { MicrosoftStrategy } from "remix-auth-socials";

const clientId = process.env.MICROSOFT_CLIENT_ID;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error(
    'Missing environment variables for Microsoft. Did you forget to add MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET to your .env file?'
  );
}

export const microsoftStrategy = new MicrosoftStrategy<User>({
  clientId,
  clientSecret,
  redirectUri: `${process.env.APP_URL}/auth/${AuthStrategies.MICROSOFT}/callback`,
},
async ({ profile }) => {
  // Do something with the tokens and profile
  return {};
});
