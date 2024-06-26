import type { Connector } from './connector.svelte'
import type { Dot } from './dot.svelte'
import State from '$lib/state/state.svelte'
import { findClusters } from '$lib/connections/clustering-algo'
import { some } from '$lib/utils/rune-every'
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
 * status (on/off), we can ping the cluster directly. They are a functional
 * abstraction based on the configuration of nodes & wires.
 */
export class Cluster {
	/**
	 * Dots in the cluster do not need to be reactive because the cluster list is
	 * regenerated every time there is a change
	 */
	readonly dots = new Set<Dot>()

	/** Cached state representing whether the cluster is on or off */
	isLive = $derived(some([...this.dots], (dot) => dot.connector.isEmitting))
}
