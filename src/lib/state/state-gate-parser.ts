import type { GateConstructor } from "$lib/logic-gates/gate.svelte"
/**
 * Numerical serialised representation of a particular {@link Gate} and a
 * particular {@link Dot} within that gate.
 */
export type DotPath = [gate: number, dot: number]

/**
 * Data structure of a saved state
 */
export type StateJSONv1 = {
	version: 1,
	gates: {
		template: string | GateConstructor<any, any>
		position: readonly [number, number]
	}[]
	wires: [from: DotPath, to: DotPath][]
}