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

export const Selected = new (class {
	list = new StateSet<Selectable>()

	select(selectable: Selectable) {
		this.list.add(selectable)
	}

	deselect(selectable: Selectable) {
		this.list.delete(selectable)
	}

	clear() {
		// @ts-expect-error
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

export function runActionOnSelected(key: keyof Actions) {
	for (const selected of selectedArray) {
		selected._run(key)
	}
}

export function copySelected() {
	navigator.clipboard.writeText(copy(gatesOnly, State.getWiresAttachedToGates(gatesOnly)))
}

export function selectAll() {
	for (const piece of State.pieces) {
		Selected.select(piece.selectable)
	}
}

type Actions = {
	delete?: () => void
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

	_run(action: keyof Actions) {
		this.actions[action]?.()
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
