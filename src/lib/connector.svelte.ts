import { Set as StateSet, Map as StateMap } from 'svelte/reactivity'
import { untrack } from 'svelte'
import { EmittanceSuppressor } from './emittance-validation.svelte'
import type { Gate } from './gate.svelte'
import type { Dot } from './dot.svelte'
import State from './state.svelte'

// Connectors are the logic behind how on/off states can communicate, they
// basically deal with

export const globalConnectorList = new StateSet<Connector>()

/**
 * Clusters are ephemeral identifiers for a network of connectors that are in
 * direct contact
 */
export const Clusters = new (class {
	list = $derived(findClusters(globalConnectorList))

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
	 * Reference map to be able to find a connector's associated cluster
	 */
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

/**
 * The cluster is an ephemeral transient class that is created and destroyed
 * whenever there is a structural or connection change. Clusters offer a
 * convenient API, for example since everything in a cluster shares the same
 * status (on/off), we can ping the cluster directly
 */
export class Cluster {
	connections = new StateSet<Connector>()

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

		for (const connection of this.connections) {
			if (connection.isEmitting) {
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
 * Allows for the relationships to be created between connectors. This includes
 * junctions, gates, sources, etc. Basically anything a wire can connect to, and
 * sometimes there may be intrinsic connections
 * ({@link Connector.intrinsicConnections}).
 *
 * Usually will be encapsulated in a {@link Dot}, which also stores position
 * {@link Position} and other type of data.
 */
export class Connector {

	/**
	 * Name of the string, useful for debugging purposes
	 */
	readonly name: string
	/**
	 * List of changeable connections
	 */
	readonly connections = new StateSet<Connector>()
	/**
	 * Regular connections {@link Connector.connections} are used and destroyed
	 * quite liberally, so it's nice to have a a place where you can take
	 * advantage of the connection logic without it being mixed around with
	 * regular usage. Good for things like switches, for example, that connect
	 * both ends through a internally managed intrinsic connection.
	 */
	readonly intrinsicConnections = new StateSet<Connector>()

	/**
	 * Whether this connection is on or off. Note that this is different from
	 * {@link Connector.isEmitting}. This pings the cluster to see if there are
	 * any emitters in the cluster, which would make this one live even if it
	 * isn't emitting
	 */
	isLive = $derived.by(() => {
		const cluster = Clusters.map.get(this)
		if (!cluster) {
			console.warn('Cluster not found!')
			return false
		}
		return cluster.isLive
	})

	/**
	 * Checks whether this connection is direcctly connected to another. Note
	 * this isn't the same as being in the same {@link Cluster}. Only immediate neighbour.
	 */
	isConnectedTo = $derived((connector: Connector) => this.connections.has(connector) || this.intrinsicConnections.has(connector))

	/**
	 * The {@link Gate} that owns this particular connector
	 */
	parent: Gate<any, any>

	constructor({
		name = '',
		immutableConnections = [],
		emitting = () => false,
		parent
	}: {
		parent: Gate<any, any>
		name?: string
		immutableConnections?: Connector[]
		emitting?: () => boolean
	}) {
		this.name = name
		this.#emitterFn = emitting
		this.parent = parent

		immutableConnections.forEach((connector) => {
			this.intrinsicConnections.add(connector)
			connector.intrinsicConnections.add(this)
		})

		// Allows to track the state of currently instantiated connectors
		globalConnectorList.add(this)
	}

	/**
	 * Responsible for storing the logical pattern of what makes this particular
	 * logical gate what it is. It can be as simple as () => true for a source.
	 */
	readonly #emitterFn = $state<() => boolean>(() => false)

	/**
	 * Calculating emittance is a controlled non-reactive process to prevent
	 * endless loops (imagine a not gate connected back to front)
	 */
	processEmittance() {
		this.isEmitting = !EmittanceSuppressor.suppressed && this.#emitterFn()
	}

	/**
	 * Whether or not this particular function is emitting. Different from being
	 * live, see {@link Connector.isLive}
	 */
	isEmitting = $state(false)

	/**
	 * Create connection to another connector. This adds that connector to this
	 * list, and this connector to that list. Uses {@link EmittanceSuppressor}
	 * to cute down on unnecessary work and possible infinite loops.
	 * @param e
	 */
	connectTo(e: Connector) {
		if (this.connections.has(e)) throw new Error('Tried to connect to something that was already connected')
		if (e.connections.has(this)) throw new Error('Tried to connect to another dot but it already was connected to me')

		// Wrap this action in a validation protector, essentially suppressing
		// reactivity until the next tick(). If we do a lot of these, it gets
		// really slow.
		EmittanceSuppressor.validate(() => {
			this.connections.add(e)
			e.connections.add(this)
		})
	}

	/**
	 * Opposite to {@link Connector.connectTo}, also uses validation protection
	 * via {@link EmittanceSuppressor}
	 * @param e 
	 */
	disconnectFrom(e: Connector) {
		EmittanceSuppressor.validate(() => {
			this.connections.delete(e)
			e.connections.delete(this)
		})
	}

	/**
	 * Destroys all connections to and from this connector. Also removes from
	 * {@link globalConnectorList}.
	 */
	destroy() {
		for (const connector of this.connections) {
			this.disconnectFrom(connector)
		}
		for (const connector of this.intrinsicConnections) {
			this.intrinsicConnections.delete(connector)
			connector.intrinsicConnections.delete(this)
		}
		// Automatic
		// for (const connector of this.positionConnections) {
		// 	this.positionConnections.delete(connector)
		// 	connector.positionConnections.delete(this)
		// }
		globalConnectorList.delete(this)
	}
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
	for (const connector of globalConnectorList) {
		connector.processEmittance()
	}

	// Now that we've processed, lets do the cache again.
	Clusters.dirtify()
}

/**
 * Finds individual clusters based on a set of interconnected connectors
 * @param connectorList 
 * @returns the entire connector list sorted into clusters
 */
function findClusters(connectorList: StateSet<Connector>): StateSet<Cluster> {
	let clusters = new StateSet<Cluster>()
	let visited = new Set<Connector>()

	function dfs(connector: Connector, currentCluster: Cluster) {
		visited.add(connector)

		// Untrack is important here, otherwise if we are being called in a
		// reactive context, these will be added as dependencies!
		untrack(() => {
			currentCluster.connections.add(connector)
		})

		for (const neighbour of connector.connections) {
			if (!visited.has(neighbour)) {
				dfs(neighbour, currentCluster)
			}
		}
		for (const neighbour of connector.intrinsicConnections) {
			if (!visited.has(neighbour)) {
				dfs(neighbour, currentCluster)
			}
		}
	}

	for (const connector of connectorList) {
		if (!visited.has(connector)) {
			let newCluster = new Cluster()
			
			// Also make sure we omit here from tracking
			untrack(() => clusters.add(newCluster))

			dfs(connector, newCluster)
		}
	}

	return clusters
}
