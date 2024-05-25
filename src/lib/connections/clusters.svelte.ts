import type { Connector } from './connector.svelte'
import type { Dot } from './dot.svelte'
import State from '$lib/state/state.svelte'
import { EmittanceSuppressor } from './emittance-validation.svelte'
import { findClusters } from '$lib/connections/clustering-algo'
/**
 * So there's a tricky thing here where the state of the dots (whether they are
 * live or not) depend on there are any "emitters" in their cluster. And whether
 * a dot is an emitter or depends on some live status of other clusters. This
 * creates a circular loop. How do we deal with this?
 */

/**
 * Clusters are ephemeral identifiers for a network of connectors that are in
 * direct contact. This is their parent stateful container, which persists
 * throughout the app's lifetime
 */
export const Clusters = new (class {
	list = $derived(findClusters([...State.dots], State.wires))

	/** Mark all clusters as dirty */
	dirtify() {
		for (const conn of this.list) {
			conn.markDirty()
		}
	}

	/**
	 * Makes dirty and also resets the live state back to false. I actually
	 * suspect this might do nothing, but CBA to think too hard about it. I
	 * originally put it in so that in case there was some looping state that was
	 * stuck you could un-stick it.
	 */
	reset() {
		for (const conn of this.list) {
			conn.reset()
		}
	}

	/** Reference map to be able to find a dot's associated cluster */
	map = $derived.by(() => {
		const map = new Map<Connector, Cluster>()
		for (const cluster of this.list) {
			for (const dot of cluster.dots) {
				map.set(dot.connector, cluster)
			}
		}
		return map
	})
})()

/**
 * The cluster is an ephemeral transient class that is created and destroyed
 * whenever there is a structural or connection change. Clusters offer a
 * convenient API, for example since everything in a cluster shares the same
 * status (on/off), we can ping the cluster directly
 */
export class Cluster {
	/**
	 * Dots in the cluster Does not need to be reactive because the cluster list
	 * is regenerated every time there is a change
	 */
	readonly dots = new Set<Dot>()

	/**
	 * Marks dirty for when there's a structural change and we need to refresh the
	 * live status, see {@link Clusters.dirtify}
	 */
	markDirty() {
		this.#done = false
		this.#isLive = false
	}

	/** Marks dirty but without default false, see {@link Clusters.reset} */
	reset() {
		this.#isLive = false
		this.#done = true
	}

	/**
	 * To prevent redundant processing, the result is cached until marked dirty
	 * again
	 */
	#done = false

	/** Cached state representing whether the cluster is on or off */
	#isLive: boolean | null = false
	isLive = $derived.by(() => {
		// If we're clean, return the cached value
		if (this.#done) return this.#isLive

		// In case we're in the validation phase, return false to not cause any
		// unwanted interference (postpone proper calculation until after
		// validation phase is over)
		if (EmittanceSuppressor.validating) return false

		let live = false

		for (const dot of this.dots) {
			if (dot.connector.isEmitting) {
				live = true
			}
		}

		this.#done = true
		this.#isLive = live

		return live
	})
}

/**
 * Essentially the heartbeat of the program. Based on current states of
 * {@link Cluster.isLive}, processes the logical outcomes of all gates and
 * updates reactions accordingly. You'll note that {@link Cluster.isLive} depends
 * on the emittance of the connections within it. An astute observator you are!
 * This is a circular dependency. Which is why we only allow one pulse at a
 * time, breaking Svelte's reactivity.
 */
export function pulse() {
	for (const { connector } of State.dots) {
		connector.processEmittance()
	}

	// Now that we've processed, lets do the cache again.
	Clusters.dirtify()
}
