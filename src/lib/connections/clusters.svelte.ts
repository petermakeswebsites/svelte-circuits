import type { Connector } from './connector.svelte'
import { Set as StateSet, Map as StateMap } from 'svelte/reactivity'
import { untrack } from 'svelte'
import type { Dot } from './dot.svelte'
import type { Wire } from '../wire/wire.svelte'
import State from '$lib/state/state.svelte'
import { EmittanceSuppressor } from './emittance-validation.svelte'

/**
 * Clusters are ephemeral identifiers for a network of connectors that are in
 * direct contact
 */
export const Clusters = new (class {
	list = $derived(findClusters(State.dots, State.wires))

	/**
	 * Mark all clusters as dirty
	 */
	dirtify() {
		for (const conn of this.list) {
			conn.markDirty()
		}
	}

	/**
	 * Makes dirty and also resets the live state back to false. I actually
	 * suspect this might do nothing, but CBA to think too hard about it. I
	 * originally put it in so that in case there was some looping state that
	 * was stuck you could un-stick it.
	 */
	reset() {
		for (const conn of this.list) {
			conn.reset()
		}
	}

	/**
	 * Reference map to be able to find a dot's associated cluster
	 */
	map = $derived.by(() => {
		const map = new StateMap<Connector, Cluster>()
		for (const cluster of this.list) {
			untrack(() => {
				for (const dot of cluster.dots) {
					map.set(dot.connector, cluster)
				}
			})
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
	dots = new StateSet<Dot>()

	/**
	 * Marks dirty for when there's a structural change and we need to refresh
	 * the live status, see {@link Clusters.dirtify}
	 */
	markDirty() {
		this.#done = false
		this.#isLive = false
	}

	/**
	 * Marks dirty but without default false, see {@link Clusters.reset}
	 */
	reset() {
		this.#isLive = false
		this.#done = true
	}

	/**
	 * To prevent redundant processing, the result is cached until marked dirty
	 * again
	 */
	#done = $state(false)
	/**
	 * Cached state representing whether the cluster is on or off
	 */
	#isLive = $state<boolean | null>(false)
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

		untrack(() => {
			this.#done = true
			this.#isLive = live
		})

		return live
	})
}

/**
 * Essentially the heartbeat of the program. Based on current states of
 * {@link Cluster.isLive}, processes the logical outcomes of all gates and
 * updates reactions accordingly. You'll note that {@link Cluster.isLive}
 * depends on the emittance of the connections within it. An astute observator
 * you are! This is a circular dependency. Which is why we only allow one pulse
 * at a time, breaking Svelte's reactivity.
 */
export function pulse() {
	for (const { connector } of State.dots) {
		connector.processEmittance()
	}

	// Now that we've processed, lets do the cache again.
	Clusters.dirtify()
}

// /**
//  * Finds individual clusters based on a set of interconnected connectors
//  * @param dotList global state of dots
//  * @param wireList global state of list of wires
//  * @returns the entire connector list sorted into clusters
//  */
// function findClusters(dotList: Dot[], wireList : StateSet<Wire>): StateSet<Cluster> {
// 	let clusters = new StateSet<Cluster>()
// 	let visited = new Set<Connector>()

// 	function dfs(connector: Connector, currentCluster: Cluster) {
// 		visited.add(connector)

// 		// Untrack is important here, otherwise if we are being called in a
// 		// reactive context, these will be added as dependencies!
// 		untrack(() => {
// 			currentCluster.connections.add(connector)
// 		})

// 		for (const neighbour of connector.connections) {
// 			if (!visited.has(neighbour)) {
// 				dfs(neighbour, currentCluster)
// 			}
// 		}
// 		for (const neighbour of connector.intrinsicConnections) {
// 			if (!visited.has(neighbour)) {
// 				dfs(neighbour, currentCluster)
// 			}
// 		}
// 	}

// 	for (const connector of connectorList) {
// 		if (!visited.has(connector)) {
// 			let newCluster = new Cluster()

// 			// Also make sure we omit here from tracking
// 			untrack(() => clusters.add(newCluster))

// 			dfs(connector, newCluster)
// 		}
// 	}

// 	return clusters
// }

class UnionFind {
	private parent: Map<Dot, Dot>
	private rank: Map<Dot, number>

	constructor(dots: Dot[]) {
		this.parent = new Map()
		this.rank = new Map()

		// Initialize each dot as its own parent (self loop) and rank as 0
		dots.forEach((dot) => {
			this.parent.set(dot, dot)
			this.rank.set(dot, 0)
		})
	}

	// Find the root of the dot with path compression
	find(dot: Dot): Dot {
		if (this.parent.get(dot) !== dot) {
			this.parent.set(dot, this.find(this.parent.get(dot)!))
		}
		return this.parent.get(dot)!
	}

	// Unite two dots
	union(dot1: Dot, dot2: Dot) {
		let root1 = this.find(dot1)
		let root2 = this.find(dot2)

		if (root1 !== root2) {
			let rank1 = this.rank.get(root1)!
			let rank2 = this.rank.get(root2)!

			if (rank1 > rank2) {
				this.parent.set(root2, root1)
			} else if (rank1 < rank2) {
				this.parent.set(root1, root2)
			} else {
				this.parent.set(root2, root1)
				this.rank.set(root1, rank1 + 1)
			}
		}
	}
}

function findClusters(dots: Dot[], wireList: StateSet<Wire>): Cluster[] {
	const uf = new UnionFind(dots)

	// Unite all connected dots
	for (const wire of wireList) {
		uf.union(wire.from, wire.to)
	}

	// Group dots into clusters based on their root parent
	const clusterMap: Map<Dot, Cluster> = new Map()

	// Untrack because we only really need to be reactive to dots and wireList
	// without the need for fine grained reactivity
	untrack(() => {
		dots.forEach((dot) => {
			const root = uf.find(dot)
			if (!clusterMap.has(root)) {
				clusterMap.set(root, new Cluster())
			}
			clusterMap.get(root)!.dots.add(dot)
		})
	})

	return Array.from(clusterMap.values())
}
