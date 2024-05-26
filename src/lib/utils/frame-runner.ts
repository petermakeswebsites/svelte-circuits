/**
 * Utility function to queue a function for the next animation frame, replacing
 * the previous one if there is one
 */
export class FrameRunner {
	#reference = 0

	replaceFrame<T extends () => void>(fn: T) {
		cancelAnimationFrame(this.#reference)
		this.#reference = requestAnimationFrame(fn)
	}
}
