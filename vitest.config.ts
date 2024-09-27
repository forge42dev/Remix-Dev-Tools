import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		globals: true,
		environment: "happy-dom",
		exclude: ["**/node_modules/**", "**/dist/**", "**/docs/**", "**/public/**", "**/test-apps/**"],
		coverage: {
			include: ["src/**/*"],
			reporter: ["text", "json-summary", "json", "html"],
			reportOnFailure: true,
			all: false,
			thresholds: {
				statements: 80,
				branches: 80,
				functions: 80,
				lines: 80,
			},
		},
	},
})
