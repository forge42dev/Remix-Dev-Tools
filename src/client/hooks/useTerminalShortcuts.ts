import { type KeyboardEvent, useState } from "react"
import type { Terminal } from "../context/terminal/types.js"
import { useTerminalContext } from "../context/useRDTContext.js"

const useTerminalShortcuts = ({
	onSubmit,
	setCommand,
	terminal,
	projectCommands,
	sendJsonMessage,
}: {
	onSubmit: () => void
	setCommand: (cmd: string) => void
	terminal: Terminal
	projectCommands?: Record<string, string>
	sendJsonMessage: (msg: Record<string, any>) => void
}) => {
	const [historyIndex, setHistoryIndex] = useState<number>()
	const [projectCommandIndex, setProjectCommandIndex] = useState<number>()
	const availableCommands = Object.keys(projectCommands ?? {})

	const { addTerminalOutput, clearTerminalOutput } = useTerminalContext()
	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault()
			onSubmit()
		}
		if (e.key === "ArrowUp") {
			e.preventDefault()
			if (historyIndex === 0) {
				setHistoryIndex(0)
				return setCommand(terminal.history[0])
			}
			const newIndex = historyIndex === undefined ? terminal.history.length - 1 : historyIndex - 1
			setHistoryIndex(newIndex)
			setCommand(terminal.history[newIndex])
		}
		if (e.key === "ArrowDown") {
			e.preventDefault()
			if (historyIndex === terminal.history.length - 1) {
				setHistoryIndex(terminal.history.length - 1)
				return setCommand(terminal.history[history.length - 1] ?? "")
			}

			const newIndex = historyIndex === undefined ? terminal.history.length - 1 : historyIndex + 1
			setHistoryIndex(newIndex)
			setCommand(terminal.history[newIndex])
		}
		if (e.key === "ArrowLeft" && projectCommands) {
			e.preventDefault()
			if (projectCommandIndex === 0) {
				setProjectCommandIndex(0)
				return setCommand(`npm run ${availableCommands[0]}` ?? "")
			}
			const newIndex = projectCommandIndex === undefined ? availableCommands.length - 1 : projectCommandIndex - 1
			setProjectCommandIndex(newIndex)
			setCommand(`npm run ${availableCommands[newIndex]}`)
		}
		if (e.key === "ArrowRight" && projectCommands) {
			e.preventDefault()
			if (projectCommandIndex === availableCommands.length - 1) {
				setProjectCommandIndex(availableCommands.length - 1)
				const toRun = availableCommands[history.length - 1]
				return setCommand(toRun ? `npm run ${toRun}` : "")
			}

			const newIndex = projectCommandIndex === undefined ? availableCommands.length - 1 : projectCommandIndex + 1
			setProjectCommandIndex(newIndex)
			setCommand(`npm run ${availableCommands[newIndex]}`)
		}
		if (e.ctrlKey && e.key === "c") {
			e.preventDefault()
			sendJsonMessage({
				type: "kill",
				terminalId: terminal.id,
				processId: terminal.processId,
			})
			addTerminalOutput(terminal.id, {
				type: "output",
				value: "^C \n",
			})
		}
		if (e.ctrlKey && e.key === "l") {
			e.preventDefault()
			clearTerminalOutput(terminal.id)
		}
	}
	return { onKeyDown }
}

export { useTerminalShortcuts }
