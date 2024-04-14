import { Vec } from '../position/vec'

export class Box {
	constructor(p1: Vec, p2: Vec) {
		this.from = new Vec(p1[0] < p2[0] ? p1[0] : p2[0], p1[1] < p2[1] ? p1[1] : p2[1])
		this.to = new Vec(p1[0] < p2[0] ? p2[0] : p1[0], p1[1] < p2[1] ? p2[1] : p1[1])
	}

	hasWithin(v: Vec) {
		return this.from.inside(v) && this.to.outside(v)
	}

	readonly from: Vec
	readonly to: Vec
	get dimensions() {
		return this.to.subtract(this.from)
	}
}
