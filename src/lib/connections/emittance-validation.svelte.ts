import { tick } from 'svelte'
import type { Cluster } from './clusters.svelte'

/**
 * This suppresses reactivity while doing actions like adding objects. It
 * essentially closes off calculating all the {@link Cluster} calculations. I
 * suspect it may also help from accidentally falling into weird infinite
 * loops.
 */
export const EmittanceSuppressor = new (class {
	suppressed = $state(false)

	suppress() {
		this.suppressed = true
	}

	validating = $state(false)

	/**
	 * Suppresses calculations until the next reactive cycle. This allows the
	 * potential to suppress emittance calculations while validation takes place
	 */
	async validate(fn: () => void) {
		if (this.validating === false) {
			const original = this.suppressed
			this.suppress()
			this.validating = true
			fn()
			await tick()
			this.validating = false
			this.suppressed = original
		} else {
			fn()
		}
	}

	allow() {
		this.suppressed = false
	}

	toggle() {
		this.suppressed = !this.suppressed
	}
})()

// @ts-expect-error
globalThis.toggleEmittance = () => EmittanceSuppressor.toggle()
