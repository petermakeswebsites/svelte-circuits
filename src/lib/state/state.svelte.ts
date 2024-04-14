import { Set as StateSet } from 'svelte/reactivity'
import { untrack } from 'svelte'
import type { Dot } from '$lib/connections/dot.svelte'
import { EmittanceSuppressor } from '$lib/connections/emittance-validation.svelte'
import type { Gate } from '$lib/logic-gates/gate.svelte'
import { Wire } from '$lib/wire/wire.svelte'

export type Piece = Gate<any, any>
const State = new (class {
	wires = new StateSet<Wire>()
	pieces = new StateSet<Piece>()
	all = $derived(new StateSet([...this.wires, ...this.pieces]))
	connectors = $derived([...this.pieces].flatMap((piece) => piece.dots).map((dot) => dot.connector))
	add<T extends Wire | Piece>(r: T): T {
		EmittanceSuppressor.validate(() => this.#getAppropriateStore(r).add(r))
		return r
	}

	delete<T extends Wire | Piece>(r: T) {
		EmittanceSuppressor.validate(() => this.#getAppropriateStore(r).delete(r))
	}

	#getAppropriateStore<T extends Wire | Piece>(r: T): StateSet<T> {
		return (r instanceof Wire ? this.wires : this.pieces) as StateSet<T>
	}

	removeWiresConnectedTo(dot: Dot) {
		;[...this.wires.values()].forEach((wire) => {
			if (!!wire.isConnectedTo(dot)) this.wires.delete(wire)
		})
	}

	/**
	 * Destroys the renderable and any wire connecting to it. Different from
	 * {@link delete} which simply removes them from state.
	 * @param any
	 */
	destroy(any: Piece | Wire) {
		// Automatically disconnects if wire
		if (!(any instanceof Wire)) any.destroy()
		this.delete(any)
	}

	createWire(from: Dot, to: Dot, name = '') {
		// TODO check if duplicate wire
		this.wires.add(new Wire({ to, from, name }))
	}

	/**
	 * Structural, only reactive to change in pieces
	 */
	dots = $derived.by(() => {
		const dotList: Dot[] = []
		for (const piece of this.pieces) {
			// We know the dot structure won't change, so let's not track
			// anything here
			untrack(() => {
				for (const dot of piece.dots) {
					dotList.push(dot)
				}
			})
		}
		return new StateSet(dotList)
	})

	clearState() {
		EmittanceSuppressor.validate(() => {
			const all = [...this.all]
			for (const each of all) {
				this.destroy(each)
			}
		})
	}
})()

// @ts-ignore
globalThis.listState = () => {
	console.log(Object.fromEntries([...State.all.values()].map((x) => [x.name, x])))
}

export default State
