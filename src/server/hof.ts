import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { asyncAnalysis } from "./utils"

export const withLoaderWrapper = (loader: (args: LoaderFunctionArgs) => Promise<any>, id: string) => {
	return asyncAnalysis(id, "loader", loader)
}

export const withActionWrapper = (action: (args: ActionFunctionArgs) => Promise<any>, id: string) => {
	return asyncAnalysis(id, "action", action)
}
