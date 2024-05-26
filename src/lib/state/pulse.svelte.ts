export const Playback = new (class {
	#nextPulse = $state<(() => void) | undefined>()

	setNextPulse(fn: () => void) {
		this.#nextPulse = fn
		console.log("Ready for state change!", {fn: () => this.runNextPulse()})
	}

	runNextPulse() {
		const pulseFn = this.#nextPulse
		this.#nextPulse = undefined
		if (!pulseFn) throw new Error(`No pulse found`)
		pulseFn()
	}

	playing = true
	stop() {}
	start() {}
	reset() {}

	// HZ = 5
	// #timeout = -1
	// startLoop() {
	//     pulse()
	//     this.#timeout = setTimeout(() => this.startLoop(), 1000/this.HZ)
	// }
	//
	// playing = $state(true)
	// stop() {
	//     this.playing = false
	//     clearTimeout(this.#timeout)
	// }
	//
	// start() {
	//     clearTimeout(this.#timeout)
	//     this.startLoop()
	//     this.playing = true
	// }

	constructor() {
		// this.startLoop()
	}
})()

// @ts-expect-error
window.pulse = () => Playback.runNextPulse()
