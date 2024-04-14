import { Dot } from "$lib/connections/dot.svelte"
import { Position } from "$lib/position/position.svelte"
import { Draggable } from "$lib/selecting/selectable.svelte"
import State from "$lib/state/state.svelte"

export class Switcher {
	name = ''
	position = new Position(0, 0)
	from = new Dot({ name: 'switcher from', x: -10, y: 10, parent: this })
	to = new Dot({ name: 'switcher to', x: 30, y: 10, parent: this })

	#open = $state(true)
	get open() {
		return this.#open
	}

	set open(shouldOpen) {
		throw new Error("TODO")
		if (shouldOpen) {
			this.from.connector.disconnectFrom(this.to.connector)
		} else {
			this.from.connector.connectTo(this.to.connector)
		}
		this.#open = shouldOpen
	}

	toggle() {
		this.open = !this.#open
	}

	readonly selectable

	constructor({ x = 0, y = 0, name = '' }) {
		this.position.x = x
		this.position.y = y
		this.name = name
		this.selectable = new Draggable(
			{
				delete: () => {
					State.destroy(this)
				}
			},
			this.position, this
		)
	}

	get dots() {
		return [this.from, this.to]
	}

	destroy() {
		this.from.destroy()
		this.to.destroy()
	}
}
