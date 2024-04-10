import { Dot } from './dot.svelte'
import { Position } from './position.svelte'
import { Selectable } from './selectable.svelte'
import State from './state.svelte'

export class TwoInOneOut {
	name = ''
	position = new Position(0, 0)
	input1 = new Dot({ x: -10, y: 0, parent: this.position, name: "input1" })
	input2 = new Dot({ x: -10, y: 20, parent: this.position, name: "input2"  })
    output = new Dot({ x: 50, y: 10, parent: this.position, name: "output"  })

	get dots() {
		return [this.input1, this.input2]
	}

	selectable = new Selectable({
		delete: () => {
			State.destroy(this)
		}
	})

	constructor({ x = 0, y = 0, name = '', calculation }: { x: number; y: number; name: string; calculation: () => boolean }) {
		this.name = name
		this.position.x = x
		this.position.y = y
		this.output.connector.emittingFn = calculation
	}

	destroy() {
		this.input1.destroy()
		this.input2.destroy()
	}
}
