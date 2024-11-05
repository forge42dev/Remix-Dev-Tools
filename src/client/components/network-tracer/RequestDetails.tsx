import { motion } from "framer-motion"
import type React from "react"
import { METHOD_COLORS } from "../../tabs/TimelineTab"
import { Tag } from "../Tag"
import { Icon } from "../icon/Icon"
import { JsonRenderer } from "../jsonRenderer"
import { TYPE_COLORS } from "./NetworkWaterfall"
import type { NetworkRequest } from "./types"

interface RequestDetailsProps {
	request: NetworkRequest
	onClose: () => void
	onChangeRequest: (order: number) => void
	total: number
	order: number
}
const REQUEST_COLORS = {
	loader: "border-green-500",
	"client-loader": "border-blue-500",
	action: "border-yellow-500",
	"client-action": "border-purple-500",
}
export const RequestDetails: React.FC<RequestDetailsProps> = ({ request, onClose, total, order, onChangeRequest }) => {
	console.log(request)
	return (
		<div className=" w-full mt-4 bg-main rounded-lg shadow-xl p-4 z-50">
			<div className="text-sm">
				<div className="font-bold text-lg mb-2 flex-col gap-4 w-full items-center">
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-2">
							{request?.method && (
								<Tag className="w-max" color={METHOD_COLORS[request.method]}>
									{request.method}
								</Tag>
							)}
							{request?.type && (
								<div
									className={`w-max flex items-center rounded px-2.5 py-0.5 text-sm font-medium border ${REQUEST_COLORS[request.type]}`}
								>
									{request.type}
								</div>
							)}
						</div>
						<div className="flex ml-auto items-center gap-4">
							<div className="flex items-center gap-2">
								{order > 0 ? (
									<button
										type="button"
										onClick={() => onChangeRequest(order - 1)}
										className="text-gray-400 hover:text-white flex items-center justify-center size-8 rounded-md border border-gray-500 text-gray-500"
									>
										<Icon name="ChevronDown" className="rotate-90" />
									</button>
								) : null}
								{order < total - 1 ? (
									<button
										type="button"
										onClick={() => onChangeRequest(order + 1)}
										className="text-gray-400 hover:text-white flex items-center justify-center size-8 rounded-md border border-gray-500 text-gray-500"
									>
										<Icon name="ChevronDown" className="-rotate-90" />
									</button>
								) : null}
							</div>
							<button
								type="button"
								className="text-gray-400 hover:text-white flex items-center justify-center size-8 rounded-md border border-red-500 text-red-500"
								onClick={onClose}
							>
								<Icon name="X" />
							</button>
						</div>
					</div>
					{request.id} <span className="font-normal text-green-500">- {request.url}</span>
				</div>

				<div>
					Request duration: {new Date(request.startTime).toLocaleTimeString()}{" "}
					{request.endTime && `- ${new Date(request.endTime).toLocaleTimeString()} `}
					{request.endTime && (
						<span className="font-bold text-green-500">({(request.endTime - request.startTime).toFixed(0)}ms)</span>
					)}
				</div>

				{request.data && (
					<div className="mt-4 border border-gray-800 rounded-lg overflow-hidden border-2">
						<div className="w-full px-4 py-2 bg-gray-800 text-lg">Returned Data</div>
						<div className="p-4">
							<JsonRenderer data={request.data} />
						</div>
					</div>
				)}
				{request.headers && Object.keys(request.headers).length > 0 && (
					<div className="mt-4 border border-gray-800 rounded-lg overflow-hidden border-2">
						<div className="w-full px-4 py-2 bg-gray-800 text-lg">Headers</div>
						<div className="p-4">
							<JsonRenderer data={request.headers} />
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
