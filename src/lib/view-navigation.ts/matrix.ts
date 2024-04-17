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
	inverse() {
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

	static createTranslationMatrix(v : Vec): Matrix {
		return new Matrix(1, 0, 0, 1, v[0], v[1])
	}

	static createScaleMatrix(scale: number): Matrix {
		return new Matrix(scale, 0, 0, scale, 0, 0)
	}

	multiply(B: Matrix): Matrix {
		return new Matrix(
			this.vals[0] * B.vals[0] + this.vals[2] * B.vals[1],
			this.vals[1] * B.vals[0] + this.vals[3] * B.vals[1],
			this.vals[0] * B.vals[2] + this.vals[2] * B.vals[3],
			this.vals[1] * B.vals[2] + this.vals[3] * B.vals[3],
			this.vals[0] * B.vals[4] + this.vals[2] * B.vals[5] + this.vals[4],
			this.vals[1] * B.vals[4] + this.vals[3] * B.vals[5] + this.vals[5]
		)
	}

	zoomAtPoint(scale: number, v : Vec): Matrix {
		const translateToOrigin = Matrix.createTranslationMatrix(v.times(-1))
		const scaleMatrix = Matrix.createScaleMatrix(scale)
		const translateBack = Matrix.createTranslationMatrix(v)

		let tempMatrix = translateToOrigin.multiply(scaleMatrix)
		let newMatrix = tempMatrix.multiply(translateBack)

		return newMatrix
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