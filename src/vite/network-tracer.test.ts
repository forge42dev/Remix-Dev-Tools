import { generate, parse } from "./babel"
import { transform as changeExports, transformCode } from "./network-tracer"

describe("transform", () => {
	it("should transform named exports", () => {
		const result = transformCode(
			`
			export const loader = async ({ request }) => { return {}};
			export const clientLoader = () => {}
			export function clientAction() {}
			export function action(){}`,
			"test"
		)
		console.log(result)
	})
})
