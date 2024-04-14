import { tick } from 'svelte'
import type { Cluster } from '../connections/clusters.svelte'

export const EmittanceSuppressor = new (class {
	suppressed = $state(false)
	suppress() {
		this.suppressed = true
        this.#validationList.clear()
	}

	#validationList = new Set<Cluster>()
	validationIsOk(cluster: Cluster): boolean {
        console.log("list", this.#validationList)
        let rtnVal : boolean
		if (this.#validationList.has(cluster)) {
			rtnVal = false
		} else {
			this.#validationList.add(cluster)
			rtnVal = true
		}
        console.log("pass:", rtnVal)
        return rtnVal
	}

	validating = $state(false)
	/**
	 * Suppresses calculations until the next reactive cycle.
	 * This allows the potential to suppress emittance calculations
	 * while validation takes place
	 */
	async validate(fn: () => void) {
		if (this.validating === false) {
            // console.group("Validation", this.suppressed ? 'Already suppressed' : 'Not suppressed, suppressing!')
			const original = this.suppressed
            // console.log('Surpressing...')
			this.suppress()
			this.validating = true
            // console.log('Running func...')
			fn()
			await tick()
            // console.log("Ready to clusterify!")
			this.validating = false
			this.suppressed = original
            // console.log('Resetting...')
            // console.log('Unsurpressing...')
            console.groupEnd()
		} else {
            // console.log("Running inner func")
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
