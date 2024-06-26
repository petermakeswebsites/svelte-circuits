import { Dot } from '$lib/connections/dot.svelte'
import type { StubDirection } from '$lib/connections/stub'
import { Position } from '$lib/position/position.svelte'
import { Vec, type VecSerialised } from '$lib/position/vec'
import { Box, type BoxSerialised } from '$lib/selecting/box'
import { Draggable, setupKeyDrag } from '$lib/selecting/selectable.svelte'
import State from '$lib/state/state.svelte'
import { type TupleType, lengthMap, type NumericRange } from '$lib/utils/type-helpers'
import { type Evaluation, createEvaluation } from './gate-formula'
import { isTemplate, type Templates } from './templates'

/**
 * Essentially the template for a gate. You can actually create your own gates
 * with this with your own custom logic.
 */
export type GateConstructor<T extends number, R extends number> = {
	/** Initial position of the gate */
	vec: Vec
	/** Name of the gate, e.g. `nor`, `xor`... */
	name: string
	/** SVG paths to draw the gate */
	paths: string[]
	/** Bounding box of the gate, */
	box: Box
	/** Whether it does anything or is just a dead picture */
	dummy: boolean
	/** Name of the gate to save serialisation space * */
	template?: keyof typeof Templates
	/** Inputs of gate */
	inputs: TupleType<
		T,
		{
			/** Location of the input */
			vec: Vec
			name: string
			/** Direction of the stub sticking out of the dot */
			stub: StubDirection
		}
	>
	/** Inputs of gate */
	outputs: TupleType<
		R,
		{
			/** Location of the gate * */
			vec: Vec
			name: string
			stub: StubDirection
			/**
			 * Calculates whether the output should emit
			 *
			 * @param args The input live values
			 * @returns Whether it should emit or not
			 */
			emitter: (...args: TupleType<T, boolean>) => boolean
		}
	>
}

/**
 * Gates are the main body of any logical operator. They contain view data like
 * SVG path, as well as amount of inputs, outputs, and under what conditions the
 * outputs should change
 */
export class Gate<T extends number, R extends number> {
	inputs = $state<TupleType<T, Dot>>()! // assigned in constructor
	outputs = $state<TupleType<R, Dot>>()! // assigned in constructor

	getInput(num: NumericRange<T>) {
		return this.inputs[num]
	}

	getOutput(num: NumericRange<R>) {
		return this.outputs[num]
	}

	/**
	 * Whether this particular gate is a dummy, maybe used only for display
	 * purposes and not functional
	 */
	readonly dummy
	/** The bounding box of the Gate */
	box: Box
	/** Position of the gate on the SVG */
	position: Position
	/** Name of the gate for debugging purposes */
	name: string
	/** To save memory, default gates are referred to using templates */
	readonly template: keyof typeof Templates | GateConstructor<T, R>

	constructor(gate: GateConstructor<T, R>) {
		this.template = gate.template ? gate.template : gate
		this.dummy = gate.dummy
		this.name = gate.name
		this.position = new Position(gate.vec)
		this.box = gate.box
		this.inputs = lengthMap(gate.inputs, ({ name, vec, stub }) => new Dot({ name, vec, stub, parent: this }))
		this.outputs = lengthMap(
			gate.outputs,
			({ vec, name, emitter, stub }) =>
				new Dot({
					vec,
					name,
					parent: this,
					stub,
					emitting: () => {
						return emitter(...lengthMap(this.inputs, (dot) => !!dot.connector.isLive))
					}
				})
		)
		this.paths = gate.paths

		this.selectable = new Draggable(
			{
				delete: () => {
					State.destroy(this)
				},
				key: setupKeyDrag(this.position)
			},
			this.position,
			this
		)
	}

	/** Return a list of all input and output {@link Dot}s */
	get dots() {
		return [...this.inputs, ...this.outputs]
	}

	/** Whether the body is actually live or not */
	get bodyLive() {
		return this.outputs.every((output) => output.connector.isEmitting)
	}

	/** SVG paths that draw out the gate's shape */
	readonly paths: string[]

	/** API that allows the gate to be selected, moved, and dragged */
	readonly selectable

	/** Destroy the dot by destroying all the dots connected to the gate */
	destroy() {
		for (const dot of this.dots) {
			dot.destroy()
		}
	}
}

type DotSerialised = {
	vec: VecSerialised
	stub: StubDirection
	name: string
}

type Output<T extends number> = DotSerialised & {
	emittingFn: Evaluation<T>
}

type Input = DotSerialised & {}

export type GateSerialised<T extends number, R extends number> = {
	inputs: TupleType<T, Input>
	outputs: TupleType<R, Output<T>>
	paths: string[]
	box?: BoxSerialised
	template?: string
}

export function createGateTemplateMaker<T extends number, R extends number>(
	serialised: GateSerialised<T, R>
): (settings: { vec: Vec; name: string; dummy?: boolean }) => GateConstructor<T, R> {
	const inputs = lengthMap(serialised.inputs, (input) => ({
		name: input.name,
		vec: Vec.fromArr(input.vec),
		stub: input.stub
	}))

	const outputs = lengthMap(serialised.outputs, (output) => ({
		name: output.name,
		vec: Vec.fromArr(output.vec),
		emitter: createEvaluation(output.emittingFn),
		stub: output.stub
	}))

	const paths = serialised.paths
	const box = serialised.box || Box.centre(new Vec(50, 50)).centre().toArr()

	return ({ vec, name, dummy = false }: { vec: Vec; name: string; dummy?: boolean }) => {
		if (!isTemplate(serialised.template)) throw new Error(`Template ${serialised.template} is was not found in the template list`)
		const gateConstructor: GateConstructor<T, R> = {
			inputs,
			outputs,
			name,
			paths,
			vec,
			box: Box.fromArr(box),
			template: serialised.template,
			dummy
		}
		return gateConstructor
	}
}
