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
			if (connection.getEmitting()) return true
		}
		return false
	})
}

export class Connector {
	readonly name: string
	readonly connections = new StateSet<Connector>()
	readonly immutableConnections = new StateSet<Connector>()
	// #immediateNeighbors = $derived(new StateSet([...this.connections, ...this.immutableConnections]))

	// This works
	isLive = $derived.by(() => {
		const cluster = Clusters.map.get(this)
		if (!cluster) throw new Error('Cluster not  found!')
		return cluster.isLive
	})

	// These don't work
	// cluster = $derived.by(() => {
	// 	const cluster = Clusters.map.get(this)
	// 	if (!cluster) throw new Error('Cluster not  found!')
	// 	return cluster
	// })
	// isLive = $derived.by(() => {
	// 	return this.cluster.isLive
	// })

	isConnectedTo = $derived((connector: Connector) => this.connections.has(connector) || this.immutableConnections.has(connector))

	constructor({
		name = '',
		immutableConnections = [],
		emitting = () => false
	}: { name?: string; immutableConnections?: Connector[]; emitting?: () => boolean } = {}) {
		this.name = name
		this.getEmitting = emitting

		immutableConnections.forEach((connector) => {
			this.immutableConnections.add(connector)
			connector.immutableConnections.add(this)
		})

		globalConnectorList.add(this)
	}

	getEmitting = $state<() => boolean>(() => false)

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
	let visited = new Set<Connector>()

	function dfs(connector: Connector, currentCluster: Cluster) {
		visited.add(connector)

		untrack(() => {
			currentCluster.connections.add(connector)
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
}
