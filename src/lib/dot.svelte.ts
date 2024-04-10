import { Connector } from './connector.svelte'
import { Position } from './position.svelte'



export class Dot {
	readonly connector: Connector
	readonly position: Position
	readonly name: string
	constructor({
		name = '',
		x = 0,
		y = 0,
		emitting = () => false,
		parent = null,
	}: {
		name?: string
		x?: number
		y?: number
		emitting?: () => boolean
		parent?: null | Position
	} = {}) {
		this.name = name
		this.position = new Position(x, y, parent)
		this.connector = new Connector({ emitting, name: name + ' connector' })
	}

	destroy() {
		this.connector.destroy()
	}
}
