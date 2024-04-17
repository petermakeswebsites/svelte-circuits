import { Vec, type VecSerialised } from '../position/vec'

export class Box {
	constructor(p1: Vec, p2: Vec) {
		this.from = new Vec(p1[0] < p2[0] ? p1[0] : p2[0], p1[1] < p2[1] ? p1[1] : p2[1])
		this.to = new Vec(p1[0] < p2[0] ? p2[0] : p1[0], p1[1] < p2[1] ? p2[1] : p1[1])
	}

	hasWithin(v: Vec) {
		return this.from.lessThan(v) && this.to.greaterThan(v)
	}

	centre() {
		return Box.centre(this.dimensions)
	}

	shiftLowerRight(v : Vec) {
		return new Box(this.from, this.to.add(v))
	}

	static centre(vec: Vec) {
		const half = vec.times(1 / 2)
		return new Box(half.times(-1), half)
	}

	add(v : Vec) {
		return new Box(this.from.add(v), this.to.add(v))
	}

	readonly from: Vec
	readonly to: Vec
	get dimensions() {
		return this.to.subtract(this.from)
	}

	toArr(): BoxSerialised {
		return [this.from.toArr(), this.to.toArr()]
	}

	static fromArr(b : BoxSerialised) {
		return new Box(Vec.fromArr(b[0]), Vec.fromArr(b[1]))
	}
}

export type BoxSerialised = [from: VecSerialised, to: VecSerialised]
