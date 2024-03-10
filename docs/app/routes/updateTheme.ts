import { json, type ActionFunctionArgs, redirect } from '@remix-run/node'

import { ThemeFormSchema } from '~/hooks/useTheme'
import { setTheme } from '~/utils/server/theme.server'

export async function action({ request }: ActionFunctionArgs) {
  const formData = Object.fromEntries(await request.formData())
  const { redirectTo, theme } = ThemeFormSchema.parse(formData)

  const responseInit = {
    headers: { 'Set-Cookie': setTheme(theme) },
  }

  if (redirectTo) {
    return redirect(redirectTo, responseInit)
  }

  return json({ success: true }, responseInit)
}
