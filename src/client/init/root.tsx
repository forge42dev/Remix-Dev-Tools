import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { RemixDevTools, type RemixDevToolsProps } from "../RemixDevTools.js"
import type { RdtClientConfig } from "../context/RDTContext.js"
import { hydrationDetector } from "./hydration.js"

let hydrating = true

function useHydrated() {
	const [hydrated, setHydrated] = useState(() => !hydrating)

	useEffect(function hydrate() {
		hydrating = false
		setHydrated(true)
	}, [])

	return hydrated
}

export const defineClientConfig = (config: RdtClientConfig) => config

export const withDevTools = (Component: any, config?: RemixDevToolsProps) => () => {
	hydrationDetector()
	const hydrated = useHydrated()
	if (!hydrated) return <Component />

	return (
		<>
			<Component />
			{createPortal(<RemixDevTools {...config} />, document.body)}
		</>
	)
}

/**
 *
 * @description Injects the dev tools into the Vite App, ONLY meant to be used by the package plugin, do not use this yourself!
 */
export const withViteDevTools = (Component: any, config?: RemixDevToolsProps) => () => {
	hydrationDetector()
	function AppWithDevTools(props: any) {
		const hydrated = useHydrated()
		if (!hydrated) return <Component {...props} />
		return (
			<>
				<Component {...props} />
				{createPortal(<RemixDevTools {...config} />, document.body)}
			</>
		)
	}
	return AppWithDevTools
}
