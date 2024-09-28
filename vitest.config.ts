/// <reference types="vitest" />
/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		globals: true,
		environment: "happy-dom",
		exclude: ["**/node_modules/**", "**/dist/**", "**/docs/**", "**/public/**", "**/test-apps/**"],

		coverage: {
			provider: "v8",
			include: ["src/**/*"],
			reporter: ["text", "json-summary", "json", "html"],
			reportOnFailure: true,
			all: false,
			// @ts-expect-error
			thresholds: {
				statements: 80,
				branches: 75,
				functions: 70,
				lines: 80,
			},
		},
	},
})
