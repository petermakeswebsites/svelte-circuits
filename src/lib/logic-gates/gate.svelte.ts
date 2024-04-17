import { Dot } from "$lib/connections/dot.svelte"
import type { StubDirection } from "$lib/connections/stub"
import { Position } from "$lib/position/position.svelte"
import { Vec, type VecSerialised } from "$lib/position/vec"
import { Box, type BoxSerialised } from "$lib/selecting/box"
import { Draggable } from "$lib/selecting/selectable.svelte"
import State from "$lib/state/state.svelte"
import { every } from "$lib/utils/rune-every"
import { type TupleType, lengthMap, type NumericRange } from "$lib/utils/type-helpers"
import { type Evaluation, createEvaluation } from "./gate-formula"

export type GateConstructor<T extends number, R extends number> = {
	vec : Vec
	name: string
	paths: string[]
	box: Box
	dummy: boolean
	template?: string
	inputs: TupleType<
		T,
		{
			vec: Vec
			name: string
			stub: StubDirection
		}
	>
	outputs: TupleType<
		R,
		{
			vec: Vec
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

	readonly dummy
	box: Box
	position: Position
	name: string
	readonly template: string | GateConstructor<T, R>
	constructor(gate: GateConstructor<T, R>) {
		if (gate.template) {
			this.template = gate.template
		} else {
			this.template = gate
		}
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
				}
			},
			this.position,
			this
		)
	}

	get dots() {
		return [...this.inputs, ...this.outputs]
	}

	bodyLive = $derived(every(this.outputs, (output) => output.connector.isEmitting))

	readonly paths: string[]

	readonly selectable
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
): (settings: { vec : Vec; name: string; dummy?: boolean }) => GateConstructor<T, R> {
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
	const box = serialised.box || Box.centre(new Vec(50,50)).centre().toArr()

	return ({ vec, name, dummy = false }: { vec : Vec; name: string; dummy?: boolean }) => {
		const gateConstructor: GateConstructor<T, R> = {
			inputs,
			outputs,
			name,
			paths,
			vec,
			box : Box.fromArr(box),
			template: serialised.template,
			dummy
		}
		return gateConstructor
	}
}
