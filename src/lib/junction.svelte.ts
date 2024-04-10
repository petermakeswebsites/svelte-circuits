import { Dot } from './dot.svelte'
import { Position } from './position.svelte'
import { Selectable } from './selectable.svelte'
import State from './state.svelte'

export class Junction {
	position: Position
	joint: Dot
	name: string
	constructor({ x = 0, y = 0, name = '' } = {}) {
		this.name = name
		this.position = new Position(x, y)
		this.joint = new Dot({ name: name + ' - joint', parent: this.position })
	}

    get dots() {
        return [this.joint]
    }

    selectable = new Selectable({
        delete: () => {
            State.destroy(this)
        }
    })

	destroy() {
		this.joint.destroy()
	}
}
