import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import { authenticator } from '~/services/auth.server';

export const loader = async ({ request }: LoaderArgs) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return { message: 'You are logged in!' };
};

export default function DashboardRoute() {
  const { message } = useLoaderData();
  return (
    <div>
      <h1>{message}</h1>
      <Form method='post' action='/logout'>
        <button type='submit'>Logout</button>
      </Form>
    </div>
  );
}