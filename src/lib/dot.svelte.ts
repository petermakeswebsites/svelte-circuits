import { Set as StateSet } from 'svelte/reactivity'
import { Connector } from './connector.svelte'
import { Position } from './position.svelte'
import { untrack } from 'svelte'
import type { Gate } from './gate.svelte'
import State from './state.svelte'

/**
 * Direction for the stubby thing poking out of the connector
 */
export enum StubDirection {
	LEFT = 180,
	RIGHT = 0,
	UP = 90,
	DOWN = 270,
    NONE = "_",
}

/**
 * Current dots that are in circulation. Note this is not related to
 * {@link State}. These may not be visible. Although they should always be.
 */
export const Dots = new (class {
	list = new StateSet<Dot>()
	constructor() {
		// $effect.root(() => {
		// 	$effect(() => {
		// 		for (const dot of this.list) {
		// 			let f = dot.position.globalX
		// 			let x = dot.position.globalY
		// 		}
		// 	})
		// })
	}
	// connectorOverlaps = $derived.by(() => {
	// 	const grouped = new Map<string, Connector[]>()
	// 	const ref = new Map<Connector, string>()
	// 	for (const dot of this.list) {
	// 		const pos = dot.position.toString()
	// 		untrack(() => {
	// 			if (grouped.has(pos)) {
	// 				grouped.get(pos)!.push(dot.connector)
	// 				ref.set(dot.connector, pos)
	// 			} else {
	// 				grouped.set(pos, [dot.connector])
	// 				ref.set(dot.connector, pos)
	// 			}
	// 		})
	// 	}
	// 	return {
	// 		grouped,
	// 		ref
	// 	}
	// })
})()

/**
 * The Dot is a higher level class. It contains connection, location and view
 * information.
 */
export class Dot {
	readonly connector: Connector
	readonly position: Position
	readonly name: string
	readonly stub : StubDirection
	constructor({
		name = '',
		x = 0,
		y = 0,
		emitting = () => false,
		parent,
		stub = StubDirection.NONE
	}: {
		name?: string
		x?: number
		y?: number
		emitting?: () => boolean
		parent: Gate<any, any>
		stub?: StubDirection
	}) {
		this.name = name
		this.stub = stub
		this.position = new Position(x, y, parent.position)
		Dots.list.add(this)
		this.connector = new Connector({ emitting, parent, name: name + '+'})
	}

	destroy() {
		// Remove wires state
		State.removeWiresConnectedTo(this)

		// Destroy connector
		this.connector.destroy()

		// Delete from global list, NOT state
		Dots.list.delete(this)
	}
}
