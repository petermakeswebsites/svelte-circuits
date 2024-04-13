import { Set as StateSet } from 'svelte/reactivity'
import { Gate } from './gate.svelte'
import State from './state.svelte'
import { untrack } from 'svelte'
import type { Position } from './position.svelte'
import type { Switcher } from './switcher.svelte'
import { Hotkeys } from './hotkeys.svelte'
import { copy, paste } from './copy-paste'

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

	#relativeMoves: Map<Draggable, [x: number, y: number]> = new Map()
	beginMove(clientX: number, clientY: number) {
		this.#relativeMoves.clear()
		const all = [...this.list].filter((v) => v instanceof Draggable) as Draggable[]
		this.#relativeMoves = new Map(
			all.map((draggable) => [draggable, [draggable.associatedPosition.globalX, draggable.associatedPosition.globalY] as const])
		)
	}

	move(clientX: number, clientY: number, centralTarget?: Selectable) {
		let snapX = 0
		let snapY = 0
		if (centralTarget && centralTarget instanceof Draggable) {
			const originalPos = this.#relativeMoves.get(centralTarget)
			if (!originalPos) throw new Error(`Relative position not found in map`)
			const [ox, oy] = originalPos
			centralTarget.associatedPosition.x = ox + clientX
			centralTarget.associatedPosition.y = oy + clientY
			;[snapX, snapY] = centralTarget.associatedPosition.snapTo().diff
		}

		for (const [draggable, [ox, oy]] of this.#relativeMoves) {
			if (draggable === centralTarget) continue
			draggable.associatedPosition.x = ox + clientX + snapX
			draggable.associatedPosition.y = oy + clientY + snapY
		}
	}
})()

export const SelectionBox = new (class {
	#x = $state(0)
	#y = $state(0)
	#w = $state(0)
	#h = $state(0)

	x = $derived(this.#w > 0 ? this.#x : this.#x + this.#w)
	y = $derived(this.#h > 0 ? this.#y : this.#y + this.#h)
	w = $derived(Math.abs(this.#w))
	h = $derived(Math.abs(this.#h))
	set(x: number, y: number, width: number, height: number) {
		this.#x = x
		this.#y = y
		this.#w = width
		this.#h = height
	}

	setSize(w: number, h: number) {
		this.#w = w
		this.#h = h
	}

	transfer() {
		for (const gate of this.selectedGates) {
			Selected.select(gate)
		}
	}

	done() {
		this.#w = 0
		this.#h = 0
		this.#x = 0
		this.#y = 0
	}

	isOn = $derived(!(this.x === 0 && this.y === 0 && this.#w === 0 && this.#h === 0))

	selectedGates = $derived.by(() => {
		const selects = new Set<Selectable>()
		const position = [this.x, this.y, this.w, this.h] as const
		if (!this.isOn) return selects
		untrack(() => {
			const gates = [...State.pieces]
			for (const gate of gates) {
				if (gate.position.inside(...position)) {
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
				console.log('nice try!')
				this.navigator.clipboard.writeText(copy(gatesOnly))
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
