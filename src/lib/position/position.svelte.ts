import { untrack } from 'svelte'
import { gridspace } from '../constants/grid'
import { Vec } from './vec'

export class Position {
	vec : Vec = $state()!
	parent: Position | null = $state(null)
	global: Vec = $derived(this.parent ? this.parent.vec.add(this.vec) : this.vec)
	constructor(vec : Vec, parent: Position | null = null) {
		this.vec = vec
		this.parent = parent
	}

	set(v : Vec) {
		this.vec = v
	}

	move(delta : Vec) {
		this.vec = this.vec.add(delta)
		return this
	}

	popToGlobal() {
		return new Position(this.global)
	}

	isWithinDistanceOf(p: Position, distance: number) {
		return this.global.squaredDistTo(p.global) <= distance*distance
	}

	distanceTo(p: Position) {
		return this.global.distTo(p.global)
	}

	snapTo() {
		const oldPos = this.vec
		this.vec = this.vec.snap(gridspace)
		return {position: this, diff: this.vec.subtract(oldPos)}
	}

	get copy() {
		return new Position(this.vec, this.parent)
	}

	toArr() : readonly [x : number, y : number] {
		return untrack(() => this.global.toArr())
	}

	static fromArr(pos: [x: number, y: number]) {
		return new Position(new Vec(...pos))
	}
}
