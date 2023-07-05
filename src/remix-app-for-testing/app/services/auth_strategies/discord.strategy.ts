// Refer to https://www.npmjs.com/package/remix-auth-socials for more information
import { AuthStrategies } from "~/services/auth_strategies";
import type { User } from "~/services/auth.server";
import { DiscordStrategy } from "remix-auth-socials";

const clientID = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  throw new Error(
    'Missing environment variables for Discord. Did you forget to add DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET to your .env file?'
  );
}

export const discordStrategy = new DiscordStrategy<User>({
  clientID,
  clientSecret,
  callbackURL: `${process.env.APP_URL}/auth/${AuthStrategies.DISCORD}/callback`,
},
async ({ profile }) => {
  // Do something with the tokens and profile
  return {};
});
