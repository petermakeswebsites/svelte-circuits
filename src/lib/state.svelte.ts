import { Set as StateSet } from 'svelte/reactivity'
import { Wire } from './wire.svelte'
import type { Switcher } from './switcher.svelte'
import type { Dot } from './dot.svelte'
import type { Gate } from './gate.svelte'
import { EmittanceSuppressor } from './emittance-validation.svelte'

export type Piece = Switcher | Gate<any, any>
const State = new (class {
	wires = new StateSet<Wire>()
	pieces = new StateSet<Piece>()
	all = $derived(new StateSet([...this.wires, ...this.pieces]))
	connectors = $derived([...this.pieces].flatMap((piece) => piece.dots).map((dot) => dot.connector))
	add<T extends Wire | Piece>(r: T): T {
		if (r instanceof Wire) {
			this.wires.add(r)
		} else {
			EmittanceSuppressor.validate(() => {
				this.pieces.add(r)
			})
		}
		return r
	}

	delete<T extends Wire | Piece>(r: T): T {
		if (r instanceof Wire) {
			this.wires.delete(r)
		} else {
			this.pieces.delete(r)
		}
		return r
	}

	removeWiresConnectedTo(dot: Dot) {
		;[...this.wires.values()].forEach((wire) => {
			if (!!wire.isConnectedTo(dot)) this.wires.delete(wire)
		})
	}

	/**
	 * Destroys the renderable and any wire connecting to it
	 * @param any
	 */
	destroy(any: Piece | Wire) {
		any.destroy() // Automatically disconnects if wire
		this.delete(any)
	}

	createWire(from: Dot, to: Dot, name = '') {
		// try {
		this.wires.add(new Wire({ to, from, name }))
		// } catch (e) {
		// 	console.log(e)
		// }
	}
})()

// @ts-ignore
globalThis.listState = () => {
	console.log(Object.fromEntries([...State.all.values()].map((x) => [x.name, x])))
}

export default State
