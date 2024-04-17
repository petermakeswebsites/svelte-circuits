/**
 * Immutable location
 */
export class Vec extends Array<number> {
	get x() {
		return this[0]
	}

	get y() {
		return this[1]
	}

	is(v: Vec) {
		return v[0] == this[0] && v[1] == this[1]
	}

	constructor(x: number = 0, y: number = 0) {
		super(x, y)
		Object.freeze(this)
	}

	get isZeroVec() {
		return this[0] == 0 && this[1] == 1
	}

	add(that: Vec) {
		return new Vec(this[0] + that[0], this[1] + that[1])
	}

	get squaredDist() {
		return this[0] * this[0] + this[1] * this[1]
	}

	squaredDistTo(that: Vec) {
		return this.subtract(that).squaredDist
	}

	get dist() {
		return Math.sqrt(this.squaredDist)
	}

	distTo(that: Vec) {
		return Math.sqrt(this.squaredDistTo(that))
	}

	snap(gridspace: number) {
		return new Vec(snap(this[0], gridspace), snap(this[1], gridspace))
	}

	/**
	 * If this is inside of that. Or if all components of this are less than
	 * that. Doesn't measure magnitude.
	 * @param that
	 * @returns
	 */
	lessThan(that: Vec) {
		return this[0] <= that[0] && this[1] <= that[1]
	}

	/**
	 * If this is outside of that. Or if all components of this are more than
	 * that. Doesn't measure magnitude. It's not the opposite of
	 * {@link Vec.lessThan} if you think about it. It's to do with quadrants.
	 * @param that
	 * @returns
	 */
	greaterThan(that: Vec) {
		return this[0] > that[0] && this[1] > that[1]
	}

	get positive() {
		return this[0] >= 0 && this[1] >= 0
	}

	/**
	 * Subtract {@link that} from "this", or `this - that`
	 * @param that
	 */
	subtract(that: Vec) {
		return new Vec(this[0] - that[0], this[1] - that[1])
	}

	toArr(): VecSerialised {
		return [this[0], this[1]] as const
	}

	static fromArr(pos: VecSerialised) {
		return new Vec(...pos)
	}

	times(scalar: number) {
		return new Vec(this[0] * scalar, this[1] * scalar)
	}

	static fromPolar(theta: number, radius = 1) {
		return new Vec(Math.cos(theta) * radius, Math.sin(theta) * radius)
	}

	get cssTransform() {
		return `translate(${this[0]}, ${this[1]})`
	}
}

export type VecSerialised = readonly [x: number, y: number]

function snap(value: number, multiple: number): number {
	return Math.round(value / multiple) * multiple
}

// @ts-expect-error
globalThis.Vec = Vec