import { Set as StateSet } from 'svelte/reactivity'
import type { Source } from './source.svelte'
import { Wire } from './wire.svelte'
import type { Junction } from './junction.svelte'
import type { Switcher } from './switcher.svelte'
import type { Dot } from './dot.svelte'
import type { TwoInOneOut } from './primitives.svelte'
import type { Or } from './or.svelte'
import type { And } from './and.svelte'
import type { Gate } from './gate.svelte'

export type Piece = Source | Wire | Junction | Switcher | TwoInOneOut | And | Gate<any, any>
const State = new (class {
	wires = new StateSet<Wire>()
	pieces = new StateSet<Piece>()
    all = $derived(new StateSet([...this.wires, ...this.pieces]))
	add<T extends Wire | Piece>(r: T): T {
		if (r instanceof Wire) {
			this.wires.add(r)
		} else {
			this.pieces.add(r)
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
			if (wire.isConnectedTo(dot)) this.wires.delete(wire)
		})
	}

	/**
	 * Destroys the renderable and any wire connecting to it
	 * @param any
	 */
	destroy(any: Piece | Wire) {
		if (!(any instanceof Wire)) {
			any.dots.forEach((dot) => this.removeWiresConnectedTo(dot))
		}
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
    console.log(Object.fromEntries([...State.all.values()].map(x => ([x.name, x]))))
}

export default State
