import { useEffect, useRef, useState } from "react"

import clsx from "clsx"
import { Icon } from "../components/icon/Icon.js"
import type { Terminal as TerminalType } from "../context/terminal/types.js"
import { useTerminalContext } from "../context/useRDTContext.js"
import { useTerminalShortcuts } from "../hooks/useTerminalShortcuts.js"

interface TerminalProps {
	onClose: () => void
	terminal: TerminalType
	projectCommands?: Record<string, string>
}

const Terminal = ({ onClose, terminal, projectCommands }: TerminalProps) => {
	const { addTerminalOutput, toggleTerminalLock, setProcessId, addTerminalHistory, terminals } = useTerminalContext()
	const [command, setCommand] = useState("")
	const ref = useRef<HTMLDivElement>(null)

	const onSubmit = () => {
		sendJsonMessage({
			type: "terminal_command",
			command,
			terminalId: terminal.id,
		})
		addTerminalOutput(terminal.id, {
			type: "command",
			value: `${command}\n`,
		})
		addTerminalHistory(terminal.id, command)
		setCommand("")
		toggleTerminalLock(terminal.id)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: investigate
	useEffect(() => {
		ref.current?.scrollTo({ top: ref.current.scrollHeight })
	}, [terminal.output])
	// TODO bring back
	const sendJsonMessage = (params: any) => {}
	const { onKeyDown } = useTerminalShortcuts({
		onSubmit,
		setCommand,
		terminal,
		projectCommands,
		sendJsonMessage,
	})
	return (
		<div className="relative flex h-full w-full flex-col justify-between rounded-lg border border-gray-100/10">
			{terminals.length > 1 && (
				<button
					type="button"
					onClick={() => {
						if (terminal.locked) {
							sendJsonMessage({
								type: "kill",
								terminalId: terminal.id,
								processId: terminal.processId,
							})
						}
						onClose()
					}}
					title="Close terminal"
					className="absolute right-2 top-2"
				>
					<Icon name="X" className="h-6 w-6 stroke-red-500" />
				</button>
			)}
			<div ref={ref} className="overflow-y-auto p-2">
				{terminal.output?.map((output, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={output.value + i}
						className={clsx(
							"px-2",
							output.type === "command" && "mb-1 mt-1 block rounded-lg bg-blue-950 px-2 py-1 font-bold",
							output.type === "error" && "text-red-500 "
						)}
						// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
						dangerouslySetInnerHTML={{
							__html: output.value.split("\n").join("<br />"),
						}}
					/>
				))}
			</div>

			<div className="border-3 relative flex rounded-xl border-gray-100">
				<input
					readOnly={terminal.locked}
					onKeyDown={onKeyDown}
					value={command}
					onChange={(e) => setCommand(e.target.value)}
					onBlur={() => setCommand(command?.trim())}
					placeholder={terminal.locked ? "Command running" : "Enter command"}
					className={clsx(
						"z-10 h-8 w-full rounded-lg rounded-tl-none rounded-tr-none border-none px-6 py-0 text-lg font-medium text-gray-500",
						terminal.locked && "opacity-50"
					)}
				/>
				<button
					type="button"
					disabled={terminal.locked}
					onClick={onSubmit}
					className={clsx(
						"absolute right-0 top-0 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg rounded-l-none rounded-tr-none border-none bg-green-500",
						terminal.locked && "opacity-50"
					)}
				>
					<Icon name="Send" className="h-4 w-4 stroke-white" />
				</button>
			</div>
		</div>
	)
}

const TerminalTab = () => {
	return <div />
	//	const { terminals, addOrRemoveTerminal } = useTerminalContext()
	//	const [projectCommands, setProjectCommands] = useState<Record<string, string>>()
	//	//const sendJsonMessage = (params: any) =>{}
	//	// TODO bring back
	//	//	useEffect(() => {
	//	//		sendJsonMessage({ type: "commands" })
	//	//	}, [sendJsonMessage])
	//	return (
	//		<div className="relative mr-8 flex h-full justify-between gap-4 rounded-lg">
	//			{terminals.length < 3 && (
	//				<button type="button" className="absolute -right-8" onClick={() => addOrRemoveTerminal()}>
	//					<Icon name="Columns" />
	//				</button>
	//			)}
	//			{/*  <button className="absolute -right-8 top-8">
	//        <MonitorPlay />
	//      </button> */}
	//			{terminals.map((terminal) => (
	//				<Terminal
	//					terminal={terminal}
	//					projectCommands={projectCommands}
	//					onClose={() => addOrRemoveTerminal(terminal.id)}
	//					key={terminal.id}
	//				/>
	//			))}
	//		</div>
	//	)
}

export { TerminalTab }
