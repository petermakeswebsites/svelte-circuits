import type { Dot } from '$lib/connections/dot.svelte'
import type { Wire } from '$lib/wire/wire.svelte'
import { Cluster } from '$lib/connections/clusters.svelte'

/**
 * Union Find algorithm for O(n) (make me sound smart for using that terminology
 * but I just kind of copied this algorithm)
 * https://en.wikipedia.org/wiki/Disjoint-set_data_structure
 */
class UnionFind {
	private parent: Map<Dot, Dot>
	private rank: Map<Dot, number>

	constructor(dots: Iterable<Dot>) {
		this.parent = new Map()
		this.rank = new Map()

		for (const dot of dots) {
			this.parent.set(dot, dot)
			this.rank.set(dot, 0)
		}
	}

	find(dot: Dot): Dot {
		if (this.parent.get(dot) !== dot) {
			this.parent.set(dot, this.find(this.parent.get(dot)!))
		}
		return this.parent.get(dot)!
	}

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

/**
 * Takes dots, and wires that connects the dots, and returns clusters. The state
 * (0 or 1) of any cluster is the same across all dots within it, and therefore
 * you can think of clusters interacting with each other rather than dots.
 *
 * @param dots
 * @param wireList
 */
export function findClusters(dots: Iterable<Dot>, wireList: Iterable<Wire>): Cluster[] {
	const uf = new UnionFind(dots)

	// Unite all connected dots
	for (const wire of wireList) {
		uf.union(wire.from, wire.to)
	}

	// Group dots into clusters based on their root parent
	const clusterMap: Map<Dot, Cluster> = new Map()
	for (const dot of dots) {
		const root = uf.find(dot)
		if (!clusterMap.has(root)) {
			clusterMap.set(root, new Cluster())
		}
		clusterMap.get(root)!.dots.add(dot)
	}
	return Array.from(clusterMap.values())
}
