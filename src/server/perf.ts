export const diffInMs = (start: number, end: number = performance.now()) => Number((end - start).toFixed(2))

export const secondsToHuman = (s: number) => {
	if (s > 3600) {
		const hours = Math.floor(s / 3600)
		const minutes = Math.floor((s % 3600) / 60)
		const seconds = Math.floor((s % 3600) % 60)
		if (minutes === 0 && seconds === 0) return `${hours}h`
		if (seconds === 0) return `${hours}:${minutes}h`
		return `${hours}:${minutes}:${seconds}h`
	}
	if (s > 60) {
		const minutes = Math.floor(s / 60)
		const seconds = Math.floor(s % 60)
		if (seconds === 0) return `${minutes}m`
		return `${minutes}:${seconds}m`
	}
	return `${s}s`
}
