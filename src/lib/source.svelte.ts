import { Dot } from './dot.svelte'
import { Position } from './position.svelte'
import { Selectable } from './selectable.svelte'
import State from './state.svelte'

export class Source {
	name = ''
	position = new Position(0, 0)
	#emitting = $state(true)
	dot = new Dot({ name: 'source', emitting: () => this.#emitting, parent: this.position })

	toggle() {
		this.#emitting = !this.#emitting
	}
	constructor({ x = 0, y = 0, name = '' }) {
		this.name = name
		this.position.x = x
		this.position.y = y
	}

	destroy() {
		this.dot.destroy()
	}

    get dots() {
        return [this.dot]
    }

    readonly selectable = new Selectable({
        delete: () => {
            State.destroy(this)
        }
    })
}
