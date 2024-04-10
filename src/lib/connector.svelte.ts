import { Set as StateSet, Map as StateMap } from 'svelte/reactivity'
import { add, subtract } from './set-helpers'
import { untrack } from 'svelte'
untrack
export const globalConnectorList = new StateSet<Connector>()

export const Clusters = new (class {
	list = $derived.by(() => {
		/**
		 * Runs some stuff and returns:
		 */
		return findClusters(globalConnectorList)
	})
	map = $derived.by(() => {
		const map = new StateMap<Connector, Cluster>()
		for (const cluster of this.list) {
			for (const connection of cluster.connections) {
				untrack(() => {
					map.set(connection, cluster)
				})
			}
		}
		return map
	})
})()

class Cluster {
	connections = new StateSet<Connector>()
	isLive = $derived.by(() => {
		for (const connection of this.connections) {
			if (connection.emitting) return true
		}
		return false
	})
}

export class Connector {
	readonly name: string
	readonly connections = new StateSet<Connector>()
	readonly immutableConnections = new StateSet<Connector>()
	// #immediateNeighbors = $derived(new StateSet([...this.connections, ...this.immutableConnections]))
	// cluster = $derived.by(() => {
	// 	const allInCluster = this._getAllInClusterExcept(new Set([this]))
	// 	return allInCluster
	// })

	// This works
	// isLive = $derived.by(() => {
	// 	const cluster = Clusters.map.get(this)
	// 	if (!cluster) throw new Error('Cluster not  found!')
	// 	return cluster.isLive
	// })

	// These don't work
	cluster = $derived.by(() => {
		const cluster = Clusters.map.get(this)
		if (!cluster) throw new Error('Cluster not  found!')
		return cluster
	})
	isLive = $derived.by(() => {
		untrack(() => {
			if (this.name == 'output connector') {
				console.log('clustah', this.cluster)
			}
		})
		return this.cluster.isLive
	})

	isConnectedTo = $derived((connector: Connector) => this.connections.has(connector) || this.immutableConnections.has(connector))

	constructor({
		name = '',
		immutableConnections = [],
		emitting = () => false
	}: { name?: string; immutableConnections?: Connector[]; emitting?: () => boolean } = {}) {
		this.name = name
		immutableConnections.forEach((connector) => {
			this.immutableConnections.add(connector)
			connector.immutableConnections.add(this)
		})

		this.emittingFn = emitting
		globalConnectorList.add(this)
	}

	emittingFn = $state<() => boolean>(() => false)
	emitting = $derived.by(() => {
		return this.emittingFn()
	})

	// /**
	//  *
	//  * @param alreadyChecked History of already checked, should contain the one in which is being called as well
	//  * @returns
	//  */
	// _getAllInClusterExcept(alreadyChecked: Set<Connector>): Set<Connector> {
	// 	// console.group(this.name)
	// 	const nextCheck = subtract(this.#immediateNeighbors, alreadyChecked)
	// 	const upToNow = add(this.#immediateNeighbors, alreadyChecked)

	// 	nextCheck.forEach((connector) => {
	// 		connector._getAllInClusterExcept(upToNow).forEach((d) => upToNow.add(d))
	// 	})
	// 	// console.groupEnd()
	// 	return upToNow
	// }

	//
	// HANDLING CONNECTIONS
	//

	connectTo(e: Connector) {
		if (this.connections.has(e)) throw new Error('Tried to connect to something that was already connected')
		if (e.connections.has(this)) throw new Error('Tried to connect to another dot but it already was connected to me')
		this.connections.add(e)
		e.connections.add(this)
	}

	disconnectFrom(e: Connector) {
		console.log('Disconnecting: ', e.name, this.name)
		this.connections.delete(e)
		e.connections.delete(this)
	}

	destroy() {
		for (const connector of this.connections) {
			this.disconnectFrom(connector)
		}
		for (const connector of this.immutableConnections) {
			this.immutableConnections.delete(connector)
			connector.immutableConnections.delete(this)
		}
		globalConnectorList.delete(this)
	}
}

function findClusters(connectorList: StateSet<Connector>): StateSet<Cluster> {
	let clusters = new StateSet<Cluster>()
	// let connectorToClusterMap = new StateMap<Connector, Cluster>()
	let visited = new Set<Connector>()
	// return untrack(() => {

	// Helper function for depth-first search
	function dfs(connector: Connector, currentCluster: Cluster) {
		visited.add(connector)

		untrack(() => {
			currentCluster.connections.add(connector)
			// connectorToClusterMap.set(connector, currentCluster)
		})

		for (const neighbour of connector.connections) {
			if (!visited.has(neighbour)) {
				dfs(neighbour, currentCluster)
			}
		}
		for (const neighbour of connector.immutableConnections) {
			if (!visited.has(neighbour)) {
				dfs(neighbour, currentCluster)
			}
		}
	}

	for (const connector of connectorList) {
		if (!visited.has(connector)) {
			let newCluster = new Cluster()
			untrack(() => clusters.add(newCluster))
			dfs(connector, newCluster)
		}
	}

	return clusters
	// })
}
