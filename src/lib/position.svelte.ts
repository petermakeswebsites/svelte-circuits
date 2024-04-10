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

	distanceTo(p: Position) {
		const a = this.globalX - p.globalX
		const b = this.globalY - p.globalY
		return Math.sqrt(a * a + b * b)
	}

	snapTo(gridspace = 5) {
		this.x = snap(this.x, gridspace)
		this.y = snap(this.y, gridspace)
		return this
	}

	get copy() {
		return new Position(this.x, this.y, this.parent)
	}
}

function snap(value: number, multiple: number): number {
	return Math.round(value / multiple) * multiple
}
