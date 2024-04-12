import { Connector } from './connector.svelte'
import { Position } from './position.svelte'


export enum StubDirection {
	LEFT = 180,
	RIGHT = 0,
	UP = 90,
	DOWN = 270,
    NONE = "_",
}

export class Dot {
	readonly connector: Connector
	readonly position: Position
	readonly name: string
	readonly stub : StubDirection
	constructor({
		name = '',
		x = 0,
		y = 0,
		emitting = () => false,
		parent = null,
		stub = StubDirection.NONE
	}: {
		name?: string
		x?: number
		y?: number
		emitting?: () => boolean
		parent?: null | Position
		stub?: StubDirection
	} = {}) {
		this.name = name
		this.stub = stub
		this.position = new Position(x, y, parent)
		this.connector = new Connector({ emitting, name: name + ' connector' })
	}

	destroy() {
		this.connector.destroy()
	}
}
