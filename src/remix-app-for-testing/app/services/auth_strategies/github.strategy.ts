// Refer to https://github.com/sergiodxa/remix-auth-github for more information
import { AuthStrategies } from "~/services/auth_strategies";
import type { User } from "~/services/auth.server";
import { GitHubStrategy } from "remix-auth-github";

const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  throw new Error("Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET");
}

export const githubStrategy = new GitHubStrategy<User>({
  clientID,
  clientSecret,
  callbackURL: `${process.env.APP_URL}/auth/${AuthStrategies.GITHUB}/callback`,
},
async ({ accessToken, extraParams, profile }) => {
  // Do something with the tokens and profile
  return {};
});
