import { Form, Link } from "@remix-run/react";
import { AuthStrategies } from "~/services/auth_strategies";
import type { AuthStrategy } from "~/services/auth.server";

interface SocialButtonProps {
  provider: AuthStrategy;
  label: string;
}

const SocialButton = ({ provider, label }: SocialButtonProps) => (
  <Form action={`/auth/${provider}`} method="post">
    <button>{label}</button>
  </Form>
);

export default function LoginRoute() {
  return (
    <>
      <Link to="/">Login</Link>
      <SocialButton provider={AuthStrategies.FORM} label="Login with form" />
      <SocialButton
        provider={AuthStrategies.GITHUB}
        label="Login with github"
      />
      <SocialButton
        provider={AuthStrategies.GOOGLE}
        label="Login with google"
      />
      <SocialButton
        provider={AuthStrategies.FACEBOOK}
        label="Login with facebook"
      />
      <SocialButton
        provider={AuthStrategies.DISCORD}
        label="Login with discord"
      />
      <SocialButton
        provider={AuthStrategies.MICROSOFT}
        label="Login with microsoft"
      />
      <SocialButton provider={AuthStrategies.AUTH0} label="Login with auth0" />
    </>
  );
}
