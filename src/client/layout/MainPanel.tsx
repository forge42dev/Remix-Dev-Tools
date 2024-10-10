import clsx from "clsx"
import { useState } from "react"
import { useDetachedWindowControls, useSettingsContext } from "../context/useRDTContext.js"
import { useAttachWindowListener } from "../hooks/useAttachListener.js"
import { useDebounce } from "../hooks/useDebounce.js"
import { useResize } from "../hooks/useResize.js"

interface MainPanelProps {
	children: React.ReactNode
	isOpen: boolean
	isEmbedded?: boolean
	className?: string
}

const useResizeDetachedPanel = () => {
	const { isDetached } = useDetachedWindowControls()
	const [state, setState] = useState(0)
	const debounce = useDebounce(() => {
		setState(state + 1)
	})
	useAttachWindowListener("resize", debounce, isDetached)
}

const MainPanel = ({ children, isOpen, isEmbedded = false, className }: MainPanelProps) => {
	const { settings } = useSettingsContext()
	const { detachedWindow } = useDetachedWindowControls()
	const { height, panelLocation } = settings
	const { enableResize, disableResize, isResizing } = useResize()
	useResizeDetachedPanel()

	return (
		<div
			style={
				!isEmbedded
					? {
							zIndex: 9998,
							height: detachedWindow ? window.innerHeight : height,
						}
					: undefined
			}
			className={clsx(
				"duration-600 box-border flex overflow-auto bg-main text-white opacity-0 transition-all",
				isOpen ? "opacity-100 drop-shadow-2xl" : "!h-0",
				isResizing && "cursor-grabbing ",
				!isEmbedded
					? clsx(
							"flex-col fixed left-0 w-screen",
							panelLocation === "bottom" ? "bottom-0" : "top-0 border-b-2 border-main"
						)
					: "flex-row",
				className
			)}
		>
			{!isEmbedded && panelLocation === "bottom" && (
				<div
					onMouseDown={enableResize}
					onMouseUp={disableResize}
					className={clsx("absolute z-50 h-1 w-full", isResizing ? "cursor-grabbing" : "cursor-ns-resize")}
				/>
			)}
			{children}
			{!isEmbedded && panelLocation === "top" && (
				<div
					onMouseDown={enableResize}
					onMouseUp={disableResize}
					className={clsx("absolute bottom-0 z-50 h-1 w-full", isResizing ? "cursor-grabbing" : "cursor-ns-resize")}
				/>
			)}
		</div>
	)
}

export { MainPanel }
