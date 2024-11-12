

import { ActionFunctionArgs, data, redirect } from 'react-router'
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

  return  data({ success: true }, responseInit)
}
