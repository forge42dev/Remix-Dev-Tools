import { useState } from "react"
import { Tooltip as ReactTooltip } from "react-tooltip"
export const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<div className="relative">
			<div
				className="relative"
				onMouseEnter={() => setIsOpen(true)}
				//onMouseLeave={() => setIsOpen(false)}
			>
				{children}
			</div>
			<div
				className={`bg-slate-950 w-max bottom-full mb-2 absolute text-white p-2 rounded-lg shadow-md ${isOpen ? "flex" : "hidden"}`}
			>
				<svg width={8} height={8} viewBox="0 0 8 8">
					<title>Tooltip arrow</title>
					<path d="M0 0 L4 4 L8 0" />
				</svg>

				{text}
			</div>
		</div>
	)
}
