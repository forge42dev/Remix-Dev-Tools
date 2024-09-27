import clsx from "clsx"
import { usePersistOpen, useSettingsContext } from "../context/useRDTContext.js"
import { Logo } from "./Logo.js"

export const Trigger = ({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const { settings } = useSettingsContext()
	const { setPersistOpen } = usePersistOpen()
	const { hideUntilHover, position } = settings
	const handleHover = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, event: "enter" | "leave") => {
		if (!hideUntilHover) return
		const classesToRemove = "opacity-0"
		const classesToAdd = "opacity-100"
		if (event === "enter") {
			e.currentTarget.classList.remove(classesToRemove)
			e.currentTarget.classList.add(classesToAdd)
		}
		if (event === "leave") {
			e.currentTarget.classList.remove(classesToAdd)
			e.currentTarget.classList.add(classesToRemove)
		}
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: must be like this
		<div
			style={{ zIndex: 9999 }}
			onClick={() => {
				setIsOpen(!isOpen)
				setPersistOpen(!isOpen)
			}}
			onMouseEnter={(e) => handleHover(e, "enter")}
			onMouseLeave={(e) => handleHover(e, "leave")}
			className={clsx(
				"fixed m-1.5 h-14 w-14 cursor-pointer rounded-full transition-all ",
				hideUntilHover && "opacity-0",
				position === "bottom-right" && "bottom-0 right-0",
				position === "bottom-left" && "bottom-0 left-0",
				position === "top-right" && "right-0 top-0",
				position === "top-left" && "left-0 top-0",
				position === "middle-right" && "right-0 top-1/2 -translate-y-1/2",
				position === "middle-left" && "left-0 top-1/2 -translate-y-1/2",
				isOpen && "hidden" // Hide the button when the dev tools is open
			)}
		>
			<Logo
				className={clsx(
					"h-14 w-14 rounded-full transition-all duration-200",
					"hover:cursor-pointer hover:ring-2 hover:ring-offset-2 ring-[#212121]"
				)}
			/>
		</div>
	)
}
