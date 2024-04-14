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
	beginMove(client : Vec) {
		this.#relativeMoves.clear()
		const all = [...this.list].filter((v) => v instanceof Draggable) as Draggable[]
		this.#relativeMoves = new Map(
			all.map((draggable) => [draggable, draggable.associatedPosition.global])
		)
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
})()

export const SelectionBox = new (class {
	#from = $state<Vec>(new Vec())
	#to = $state<Vec>(new Vec())
	box = $derived(new Box(this.#from, this.#to))
	set(from : Vec, to: Vec = new Vec()) {
		this.#from = from
		this.#to = to
	}

	setTo(to : Vec) {
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

globalThis.addEventListener('keydown', function (event) {
	switch (event.key) {
		case 'Delete':
		case 'Backspace':
			for (const selected of selectedArray) {
				selected._run('delete')
			}
			break
		case 'c':
			if (Hotkeys.metaKeyDown || Hotkeys.ctrlKeyDown) {
				event.preventDefault()
				const wires = [...State.wires].filter(wire => wire.isConnectedToAny(State.dots))
				this.navigator.clipboard.writeText(copy(gatesOnly, wires))
			}
			break
		case 'v':
			if (Hotkeys.metaKeyDown || Hotkeys.ctrlKeyDown) {
				this.navigator.clipboard.readText().then((text) => {
					Selected.clear()
					if (text) {
						const ret = paste(text)
						for (const gate of ret) {
							Selected.select(gate.selectable)
						}
					}
				})
			}
		case 'a':
			if (Hotkeys.metaKeyDown || Hotkeys.ctrlKeyDown) {
				for (const piece of State.pieces) {
					Selected.select(piece.selectable)
				}
			}
	}
})

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
			console.log('deleting')
			Selected.deselect(this)
		}
	}

	selectOnly() {
		console.log('clearing?')
		// @ts-ignore
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
