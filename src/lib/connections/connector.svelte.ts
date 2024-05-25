import { Set as StateSet } from 'svelte/reactivity'
import { EmittanceSuppressor } from './emittance-validation.svelte'
import { Clusters } from './clusters.svelte'
import type { Gate } from '$lib/logic-gates/gate.svelte'

// Connectors are the logic behind how on/off states can communicate

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

	// DEPRECATED?
	
	// /**
	//  * Create connection to another connector. This adds that connector to this
	//  * list, and this connector to that list. Uses {@link EmittanceSuppressor}
	//  * to cute down on unnecessary work and possible infinite loops.
	//  * @param e
	//  */
	// connectTo(e: Connector) {
	// 	if (this.connections.has(e)) throw new Error('Tried to connect to something that was already connected')
	// 	if (e.connections.has(this)) throw new Error('Tried to connect to another dot but it already was connected to me')

	// 	// Wrap this action in a validation protector, essentially suppressing
	// 	// reactivity until the next tick(). If we do a lot of these, it gets
	// 	// really slow.
	// 	EmittanceSuppressor.validate(() => {
	// 		this.connections.add(e)
	// 		e.connections.add(this)
	// 	})
	// }

	// /**
	//  * Opposite to {@link Connector.connectTo}, also uses validation protection
	//  * via {@link EmittanceSuppressor}
	//  * @param e 
	//  */
	// disconnectFrom(e: Connector) {
	// 	EmittanceSuppressor.validate(() => {
	// 		this.connections.delete(e)
	// 		e.connections.delete(this)
	// 	})
	// }

	/**
	 * Destroys all connections to and from this connector. Also removes from
	 * {@link globalConnectorList}.
	 */
	destroy() {
		// DEPRECATED?
		// for (const connector of this.connections) {
		// 	this.disconnectFrom(connector)
		// }
		for (const connector of this.intrinsicConnections) {
			this.intrinsicConnections.delete(connector)
			connector.intrinsicConnections.delete(this)
		}
		// Automatic
		// for (const connector of this.positionConnections) {
		// 	this.positionConnections.delete(connector)
		// 	connector.positionConnections.delete(this)
		// }
	}
}