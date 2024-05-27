import { FrameRunner } from '$lib/utils/frame-runner'

const START_PLAYING = true

export const Pulse = new (class {
	#nextPulse = $state<(() => void) | undefined>()
	readyForNextPulse = $derived(!!this.#nextPulse)
	stateFrameRunner = new FrameRunner()

	/**
	 * Note that the function being sent may never run. The pulse will only ever
	 * run the latest function at the next frame.
	 *
	 * @param fn
	 */
	setNextPulse(fn: () => void) {
		this.#nextPulse = fn
		if (this.playing) this.runNextPulse()
	}

	runNextPulse() {
		const pulseFn = this.#nextPulse
		this.#nextPulse = undefined
		if (!pulseFn) throw new Error(`No pending pulse found`)
		this.stateFrameRunner.replaceFrame(pulseFn)
	}

	playing = $state(START_PLAYING)

	stop() {
		this.playing = false
	}

	start() {
		if (this.playing) return
		this.playing = true
		if (this.#nextPulse) this.runNextPulse()
	}

	step() {
		this.#nextPulse?.()
	}
})()

// @ts-expect-error
window.pulse = Pulse
