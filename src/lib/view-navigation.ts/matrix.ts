import { Vec } from '$lib/position/vec'

type MatrixTuple = [a: number, b: number, c: number, d: number, e: number, f: number]
export class Matrix {
	readonly vals: MatrixTuple
	constructor(a: number, b: number, c: number, d: number, e: number, f: number) {
		this.vals = [a, b, c, d, e, f]
		Object.freeze(this.vals)
	}
	get cssTransform() {
		return `matrix(${this.vals[0]},${this.vals[2]}, ${this.vals[1]}, ${this.vals[3]}, ${this.vals[4]}, ${this.vals[5]})`
	}

	applyToVec(v: Vec) {
		return new Vec(v[0] * this.vals[0] + v[1] * this.vals[2] + this.vals[4], v[0] * this.vals[1] + v[1] * this.vals[3] + this.vals[5])
	}

	/**
	 *
	 * @returns
	 * @throws
	 */
	get inverse() {
		const [a, b, c, d, e, f] = this.vals

		const determinant = a * d - b * c

		if (determinant === 0) {
			throw new Error('Matrix is not invertible because the determinant is zero.')
		}

		const invA = d / determinant
		const invB = -b / determinant
		const invC = -c / determinant
		const invD = a / determinant

		const invE = -(invA * e + invC * f)
		const invF = -(invB * e + invD * f)

		return new Matrix(invA, invB, invC, invD, invE, invF)
	}

	toArr(): MatrixTuple {
		return [...this.vals]
	}

	immodify(fn: (vals: MatrixTuple) => void): Matrix {
		const mutvals = this.toArr()
		fn(mutvals)
		return new Matrix(...mutvals)
	}

	zoomAtPoint(scale: number, v : Vec): Matrix {
		v.times(-1).times(scale)
		const scaler = this.immodify(vals => {
			vals[0] = vals[0] * scale
			vals[3] = vals[3] * scale
		})

		const invertedVec = this.inverse.applyToVec(v)

		const offsetVec = scaler.applyToVec(invertedVec)
		const difference = offsetVec.subtract(v)
		return scaler.immodify(vals => {
			vals[4] = vals[4] - difference.x
			vals[5] = vals[5] - difference.y
		})
	}

	get a() {
		return this.vals[0]
	}

	get b() {
		return this.vals[1]
	}

	get c() {
		return this.vals[2]
	}

	get d() {
		return this.vals[3]
	}

	get e() {
		return this.vals[4]
	}

	get f() {
		return this.vals[5]
	}
}

// @ts-expect-error
globalThis.Matrix = Matrix