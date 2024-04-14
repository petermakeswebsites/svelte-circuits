import type { Gate } from '$lib/logic-gates/gate.svelte'
import { Position } from '$lib/position/position.svelte'
import { Vec } from '$lib/position/vec'
import State from '$lib/state/state.svelte'
import { Connector } from './connector.svelte'

/**
 * Direction for the stubby thing poking out of the connector
 */
export enum StubDirection {
	LEFT = 180,
	RIGHT = 0,
	UP = 90,
	DOWN = 270,
	NONE = '_'
}

/**
 * The Dot is a higher level class. It contains connection, location and view
 * information.
 */
export class Dot {
	readonly connector: Connector
	readonly position: Position
	readonly name: string
	readonly stub: StubDirection
	readonly parent: Gate<any, any>
	constructor({
		name = '',
		vec = new Vec(0),
		emitting = () => false,
		parent,
		stub = StubDirection.NONE
	}: {
		name?: string
		vec?: Vec
		emitting?: () => boolean
		parent: Gate<any, any>
		stub?: StubDirection
	}) {
		this.name = name
		this.stub = stub
		this.parent = parent
		this.position = new Position(vec, parent.position)
		this.connector = new Connector({ emitting, parent, name: name + '+' })
	}

	destroy() {
		// Remove wires state
		State.removeWiresConnectedTo(this)

		// Destroy connector
		this.connector.destroy()
	}
}
