import { Dot, StubDirection } from './dot.svelte'
import { createEvaluation, type Evaluation } from './gate-formula'
import { Position } from './position.svelte'
import { Selectable } from './selectable.svelte'
import { lengthMap, type TupleType, type NumericRange } from './type-helpers'

export type GateConstructor<T extends number, R extends number> = {
	x: number
	y: number
	name: string
	paths: string[]
	box: BoundingBox
	template?: string
	inputs: TupleType<
		T,
		{
			x: number
			y: number
			name: string
			stub: StubDirection
		}
	>
	outputs: TupleType<
		R,
		{
			x: number
			y: number
			name: string
			stub: StubDirection
			emitter: (...args: TupleType<T, boolean>) => boolean
		}
	>
}

export class Gate<T extends number, R extends number> {
	inputs = $state<TupleType<T, Dot>>()! // assigned in constructor
	outputs = $state<TupleType<R, Dot>>()! // assigned in constructor
	getInput(num: NumericRange<T>) {
		return this.inputs[num]
	}

	getOutput(num: NumericRange<R>) {
		return this.outputs[num]
	}

	box: BoundingBox
	position: Position
	name: string
	readonly template: string | GateConstructor<T, R>
	constructor(gate: GateConstructor<T, R>) {
		if (gate.template) {
			this.template = gate.template
		} else {
			this.template = gate
		}

		this.name = gate.name
		this.position = new Position(gate.x, gate.y)
		this.box = gate.box
		this.inputs = lengthMap(gate.inputs, ({ name, x, y, stub }) => new Dot({ name, x, y, stub, parent: this.position }))
		this.outputs = lengthMap(
			gate.outputs,
			({ x, y, name, emitter, stub }) =>
				new Dot({
					x,
					y,
					name,
					parent: this.position,
					stub,
					emitting: () => {
						return emitter(...lengthMap(this.inputs, (dot) => dot.connector.isLive))
					}
				})
		)
		this.paths = gate.paths
	}

	get dots() {
		return [...this.inputs, ...this.outputs]
	}

	readonly paths: string[]

	readonly selectable = new Selectable()
	destroy() {
		this.inputs!.forEach((dot) => dot.destroy())
		this.outputs!.forEach((dot) => dot.destroy())
	}
}

type DotSerialised = {
	x: number
	y: number
	stub: StubDirection
	name: string
}

type Output<T extends number> = DotSerialised & {
	emittingFn: Evaluation<T>
}

type Input = DotSerialised & {}

type BoundingBox = {
	width: number
	height: number
}

export type GateSerialised<T extends number, R extends number> = {
	inputs: TupleType<T, Input>
	outputs: TupleType<R, Output<T>>
	paths: string[]
	box?: BoundingBox
	template?: string
}

export function createGateMaker<T extends number, R extends number>(
	serialised: GateSerialised<T, R>
): (settings: { x: number; y: number; name: string }) => Gate<T, R> {
	const inputs = lengthMap(serialised.inputs, (input) => ({
		name: input.name,
		x: input.x,
		y: input.y,
		stub: input.stub
	}))

	const outputs = lengthMap(serialised.outputs, (output) => ({
		name: output.name,
		x: output.x,
		y: output.y,
		emitter: createEvaluation(output.emittingFn),
		stub: output.stub
	}))

	const paths = serialised.paths
	const box = serialised.box || { x: 0, y: 0, width: 50, height: 50 }

	return ({ x, y, name }: { x: number; y: number; name: string }) => {
		const gateConstructor: GateConstructor<T, R> = {
			inputs,
			outputs,
			name,
			paths,
			x,
			y,
			box,
			template: serialised.template
		}
		return new Gate(gateConstructor)
	}
}
