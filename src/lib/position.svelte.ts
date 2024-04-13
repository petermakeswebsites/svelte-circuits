import { untrack } from 'svelte'
import { gridspace } from './grid'

export class Position {
	y: number = $state(0)
	x: number = $state(0)
	parent: Position | null = $state(null)
	globalX: number = $derived(this.parent ? this.parent.x + this.x : this.x)
	globalY: number = $derived(this.parent ? this.parent.y + this.y : this.y)
	constructor(x: number, y: number, parent: Position | null = null) {
		this.x = x
		this.y = y
		this.parent = parent
	}

	move(x: number, y: number) {
		this.x += x
		this.y += y
		return this
	}

	popToGlobal() {
		return new Position(this.globalX, this.globalY)
	}

	isWithinDistanceOf(p: Position, distance: number) {
		const a = this.globalX - p.globalX
		const b = this.globalY - p.globalY
		if (a > distance || b > distance) return false
		const d = Math.sqrt(a * a + b * b)
		return d <= distance
	}
	
	difference(that : {globalX : number, globalY : number} | {x : number, y : number} ) {
		const thatX = 'globalX' in that ? that.globalX : that.x
		const thatY = 'globalY' in that ? that.globalY : that.y
		return new Position(this.globalX - thatX, this.globalY - thatY)
	}

	distanceTo(p: Position) {
		const a = this.globalX - p.globalX
		const b = this.globalY - p.globalY
		return Math.sqrt(a * a + b * b)
	}

	snapTo() {
		const newX = snap(this.x, gridspace)
		const newY = snap(this.y, gridspace)
		const diffX = newX - this.x
		const diffY = newY - this.y
		this.x = newX
		this.y = newY
		return {position: this, diff: [diffX, diffY] as const}
	}

	get copy() {
		return new Position(this.x, this.y, this.parent)
	}

	inside(x: number, y: number, w: number, h: number) {
		if (x < this.globalX && this.globalX < x + w) {
			if (y < this.globalY && this.globalY < y + h) return true
		}
		return false
	}

	toString() {
		return this.globalX + 'x' + this.globalY
	}

	toArr() {
		return untrack(() => [this.globalX, this.globalY] as const)
	}

	static fromArr([x, y]: [x: number, y: number]) {
		return new Position(x, y)
	}
}

function snap(value: number, multiple: number): number {
	return Math.round(value / multiple) * multiple
}
