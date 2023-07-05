import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { AuthStrategies } from "~/services/auth_strategies";
import { formStrategy } from "./auth_strategies/form.strategy";
import { githubStrategy } from "./auth_strategies/github.strategy";
import { googleStrategy } from "./auth_strategies/google.strategy";
import { facebookStrategy } from "./auth_strategies/facebook.strategy";
import { discordStrategy } from "./auth_strategies/discord.strategy";
import { microsoftStrategy } from "./auth_strategies/microsoft.strategy";
import { auth0Strategy } from "./auth_strategies/auth0.strategy";

export interface User {
  // Add your own user properties here or extend with a type from your database
}

export type AuthStrategy = (typeof AuthStrategies)[keyof typeof AuthStrategies];

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage);

// Register your strategies below
authenticator.use(formStrategy, AuthStrategies.FORM);
authenticator.use(githubStrategy, AuthStrategies.GITHUB);
authenticator.use(googleStrategy, AuthStrategies.GOOGLE);
authenticator.use(facebookStrategy, AuthStrategies.FACEBOOK);
authenticator.use(discordStrategy, AuthStrategies.DISCORD);
authenticator.use(microsoftStrategy, AuthStrategies.MICROSOFT);
authenticator.use(auth0Strategy, AuthStrategies.AUTH0);
