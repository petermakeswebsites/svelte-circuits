import { Set as StateSet } from 'svelte/reactivity'
import type { Dot } from '$lib/connections/dot.svelte'
import type { Gate } from '$lib/logic-gates/gate.svelte'
import { Wire } from '$lib/wire/wire.svelte'
import { StateHistory } from './history.svelte'
import { Pulse } from '$lib/state/pulse.svelte'

export type Piece = Gate<any, any>
const State = new (class {
	wires = new StateSet<Wire>()
	pieces = new StateSet<Piece>()
	all = $derived(new StateSet([...this.wires, ...this.pieces]))
	connectors = $derived([...this.pieces].flatMap((piece) => piece.dots).map((dot) => dot.connector))

	/**
	 * The function passed to {@link Pulse} every time there is a change in state.
	 * This is generally buffered in some async way, so we need to be careful that
	 * the data is universally true no matter when its called
	 */
	pulseFn() {
		let changed = false
		for (const connector of this.connectors) {
			const unchanged = connector.calculateEmittance()
			if (!unchanged) changed = true
		}
		for (const connector of this.connectors) {
			connector.setEmittance()
		}
		if (changed) {
			this.queueNextPulse()
		}
	}

	queueNextPulse() {
		Pulse.setNextPulse(() => this.pulseFn())
	}

	triggerChangeState() {
		StateHistory.saveWhenIdle()
		// When the state changes, we want to
		this.queueNextPulse()
	}

	add<T extends Wire | Piece>(r: T): T {
		this.#getAppropriateStore(r).add(r)
		this.triggerChangeState()
		return r
	}

	delete<T extends Wire | Piece>(r: T) {
		this.#getAppropriateStore(r).delete(r)
		this.triggerChangeState()
	}

	#getAppropriateStore<T extends Wire | Piece>(r: T): StateSet<T> {
		return (r instanceof Wire ? this.wires : this.pieces) as StateSet<T>
	}

	removeWiresConnectedTo(dot: Dot) {
		for (const wire of this.wires) {
			if (!!wire.isConnectedTo(dot)) this.wires.delete(wire)
		}
		this.triggerChangeState()
	}

	/**
	 * Destroys the renderable and any wire connecting to it. Different from
	 * {@link delete} which simply removes them from state.
	 *
	 * @param any
	 */
	destroy(any: Piece | Wire) {
		// Automatically disconnects if wire
		if (!(any instanceof Wire)) any.destroy()
		this.delete(any)
		this.triggerChangeState()
	}

	createWire(from: Dot, to: Dot, name = '') {
		// TODO check if duplicate wire
		this.wires.add(new Wire({ to, from, name }))
		this.triggerChangeState()
	}

	/** Structural, only reactive to change in pieces */
	dots = $derived.by(() => {
		const pieceArray = [...this.pieces]
		// We know the dot structure won't change, so let's not track
		// anything here
		return new Set(getDotsFromPieceList(pieceArray))
	})

	clearState() {
		const all = [...this.all]
		for (const each of all) {
			this.destroy(each)
		}
		// StateHistory.saveWhenIdle()
	}

	getWiresAttachedToGates(gates: Gate<any, any>[]): Wire[] {
		const dots = new Set(getDotsFromPieceList(gates))
		const wires: Wire[] = []
		for (const wire of this.wires) {
			if (dots.has(wire.from) && dots.has(wire.to)) {
				wires.push(wire)
			}
		}
		return wires
	}
})()

function getDotsFromPieceList(pieceList: Piece[]): Dot[] {
	const dotList: Dot[] = []
	for (const piece of pieceList) {
		for (const dot of piece.dots) {
			dotList.push(dot)
		}
	}
	return dotList
}

// @ts-ignore
globalThis.listState = () => {
	console.log(Object.fromEntries([...State.all.values()].map((x) => [x.name, x])))
}

export default State
