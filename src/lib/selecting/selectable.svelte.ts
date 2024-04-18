import { Gate } from '$lib/logic-gates/gate.svelte'
import type { Switcher } from '$lib/logic-gates/switcher.svelte'
import type { Position } from '$lib/position/position.svelte'
import { Vec } from '$lib/position/vec'
import { copy, paste } from '$lib/state/copy-paste'
import State from '$lib/state/state.svelte'
import { Hotkeys } from '$lib/utils/hotkeys.svelte'
import { untrack } from 'svelte'
import { Set as StateSet } from 'svelte/reactivity'
import { Box } from './box'
import { StateHistory } from '$lib/state/history.svelte'
import type { IsEmptyArray } from '$lib/utils/type-helpers'
import { ARROWKEY_DRAG, ARROWKEY_DRAG_SHIFT } from '$lib/constants/arrowkey-drag'

export const Selected = new (class {
	list = new StateSet<Selectable>()

	select(selectable: Selectable) {
		this.list.add(selectable)
	}

	deselect(selectable: Selectable) {
		this.list.delete(selectable)
	}

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
	set(from: Vec, to: Vec = new Vec()) {
		this.#from = from
		this.#to = to
	}

	setTo(to: Vec) {
		this.#to = to
	}

	transfer() {
		for (const gate of this.selectedGates) {
			Selected.select(gate)
		}
	}

	done() {
		this.#to = new Vec()
		this.#from = new Vec()
	}

	isOn = $derived(!(this.#from.isZeroVec && this.#to.isZeroVec))

	selectedGates = $derived.by(() => {
		const selects = new Set<Selectable>()
		const box = this.box
		if (!this.isOn) return selects
		untrack(() => {
			const gates = [...State.pieces]
			for (const gate of gates) {
				if (box.hasWithin(gate.position.vec)) {
					selects.add(gate.selectable)
				}
			}
		})
		return selects
	})
})()

const selectedArray = $derived(new StateSet([...Selected.list, ...SelectionBox.selectedGates]))
const gatesOnly = $derived.by(() => {
	const newArr: Gate<any, any>[] = []
	for (const selected of selectedArray) {
		if (selected instanceof Draggable && selected.parent instanceof Gate) {
			newArr.push(selected.parent)
		}
	}
	return newArr
})

export function getSelected() {
	return copy(gatesOnly, State.getWiresAttachedToGates(gatesOnly))
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
	key?: (key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown", shift: boolean) => void
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
	for (const selected of selectedArray) {
		selected._run<T>(...args)
	}
}

export class Selectable {
	#selected = $derived(Selected.list.has(this))
	public get selected() {
		return this.#selected || selectedArray.has(this)
	}
	public set selected(value) {
		if (value) {
			Selected.select(this)
		} else {
			Selected.deselect(this)
		}
	}

	selectOnly() {
		Selected.clear()
		this.selected = true
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

export function setupKeyDrag(position : Position) : Actions["key"] {
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