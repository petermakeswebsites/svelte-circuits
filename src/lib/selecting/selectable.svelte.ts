import { ARROWKEY_DRAG, ARROWKEY_DRAG_SHIFT } from '$lib/constants/arrowkey-drag'
import { Gate } from '$lib/logic-gates/gate.svelte'
import type { Switcher } from '$lib/logic-gates/switcher.svelte'
import type { Position } from '$lib/position/position.svelte'
import { Vec } from '$lib/position/vec'
import { copy } from '$lib/state/copy-paste'
import { StateHistory } from '$lib/state/history.svelte'
import State from '$lib/state/state.svelte'
import type { IsEmptyArray } from '$lib/utils/type-helpers'
import { Set as StateSet } from 'svelte/reactivity'
import { Box } from './box'

/**
 * Global instance for handling selections
 */
export const Selected = new (class {
	/**
	 * List of current selected items
	 */
	list = new StateSet<Selectable>()

	/**
	 * Select an item (add to {@link list})
	 * @param selectable
	 */
	select(selectable: Selectable) {
		this.list.add(selectable)
	}

	/**
	 * Deselect an item (remove from {@link list})
	 * @param selectable
	 */
	deselect(selectable: Selectable) {
		this.list.delete(selectable)
	}

	selectOnly(selectable : Selectable) {
		this.clear()
		this.select(selectable)
	}

	/**
	 * Clear all selections
	 */
	clear() {
		this.list.clear()
	}

	#relativeMoves: Map<Draggable, Vec> = new Map()
	beginMove(client: Vec) {
		this.#relativeMoves.clear()
		const all = [...this.list].filter((v) => v instanceof Draggable) as Draggable[]
		this.#relativeMoves = new Map(all.map((draggable) => [draggable, draggable.associatedPosition.global]))
	}

	move(client: Vec, centralTarget?: Selectable) {
		let snap = new Vec()
		if (centralTarget && centralTarget instanceof Draggable) {
			const originalPos = this.#relativeMoves.get(centralTarget)
			if (!originalPos) throw new Error(`Relative position not found in map`)
			centralTarget.associatedPosition.set(originalPos.add(client))
			snap = centralTarget.associatedPosition.snapTo().diff
		}

		for (const [draggable, original] of this.#relativeMoves) {
			if (draggable === centralTarget) continue
			draggable.associatedPosition.set(original.add(client).add(snap))
		}
	}

	finish() {
		StateHistory.saveWhenIdle()
	}
})()

export const SelectionBox = new (class {
	#from = $state<Vec>(new Vec())
	#to = $state<Vec>(new Vec())
	box = $derived(new Box(this.#from, this.#to))

	/**
	 * Set the box co-ordinates
	 * @param from Co-ordinates of upper left corner
	 * @param to Co-ordinates of lower right corner
	 */
	set(from: Vec, to: Vec = new Vec()) {
		this.#from = from
		this.#to = to
	}

	/**
	 * Set the `to` (lower right) co-ords specifically∑
	 * @param to
	 */
	setTo(to: Vec) {
		this.#to = to
	}

	/**
	 * Transfer all thates held in the current box
	 * to the {@link Selected} state tracker
	 */
	transfer() {
		for (const gate of this.selectedGates) {
			Selected.select(gate)
		}
	}

	/**
	 * Finish with the box - resets the vectors to zero
	 */
	done() {
		this.#to = new Vec()
		this.#from = new Vec()
	}

	get isOn() {
		return !(this.#from.isZeroVec && this.#to.isZeroVec)
	}

	selectedGates = $derived.by(() => {
		const selects = new Set<Selectable>()
		const box = this.box
		if (!this.isOn) return selects
		const gates = [...State.pieces]
		for (const gate of gates) {
			if (box.hasWithin(gate.position.vec)) {
				selects.add(gate.selectable)
			}
		}
		return selects
	})
})()

/**
 * Union of the globally selected list and selected items current selected
 */
const selectedArrayAll = $derived(new Set([...Selected.list, ...SelectionBox.selectedGates]))

/**
 * Gates of all currently selected items
 */
const selectedGatesOnly = $derived.by(() => {
	const newArr: Gate<any, any>[] = []
	for (const selected of selectedArrayAll) {
		if (selected instanceof Draggable && selected.parent instanceof Gate) {
			newArr.push(selected.parent)
		}
	}
	return newArr
})

export function getSelected() {
	return copy(selectedGatesOnly, State.getWiresAttachedToGates(selectedGatesOnly))
}

export function selectAll() {
	for (const piece of State.pieces) {
		Selected.select(piece.selectable)
	}
}

export function keyDrag(draggable: Draggable) {
	return () => {}
}
type Actions = {
	delete?: () => void
	key?: (key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown', shift: boolean) => void
}

/**
 * Helps to allow autocomplete when calling {@link runActionOnSelected}
 */
type ActionParams<T extends keyof Actions> =
	IsEmptyArray<Parameters<NonNullable<Actions[T]>>> extends true ? [key: T] : [key: T, params: Parameters<NonNullable<Actions[T]>>]

/**
 * Call a certain selectable callback on all selected items
 * @param args
 */
export function runActionOnSelected<T extends keyof Actions>(...args: ActionParams<T>) {
	for (const selected of selectedArrayAll) {
		selected._run<T>(...args)
	}
}

export class Selectable {
	public get selected() {
		return selectedArrayAll.has(this)
	}

	public set selected(value) {
		if (value) {
			Selected.select(this)
		} else {
			Selected.deselect(this)
		}
	}

	_run<T extends keyof Actions>(...[key, params]: ActionParams<T>) {
		const fn = this.actions[key]
		// @ts-expect-error not sure how to solve this one
		if (fn) fn(...(params ? params : []))
	}

	toggle() {
		this.selected = !this.selected
	}
	constructor(public readonly actions: Actions = {}) {}
}

export class Draggable extends Selectable {
	readonly associatedPosition: Position
	readonly parent: Gate<any, any> | Switcher
	constructor(actions: Actions = {}, associatedPosition: Position, parent: Gate<any, any> | Switcher) {
		super(actions)
		this.associatedPosition = associatedPosition
		this.parent = parent
	}
}

export function setupKeyDrag(position: Position): Actions['key'] {
	return (key, shift) => {
		const amt = shift ? ARROWKEY_DRAG_SHIFT : ARROWKEY_DRAG
		switch (key) {
			case 'ArrowLeft':
				position.move(new Vec(-amt, 0))
				break
			case 'ArrowRight':
				position.move(new Vec(amt, 0))
				break

			case 'ArrowUp':
				position.move(new Vec(0, -amt))
				break
			case 'ArrowDown':
				position.move(new Vec(0, amt))
				break
		}
	}
}
