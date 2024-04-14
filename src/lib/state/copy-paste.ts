import { Vec } from '$lib/position/vec'
import type { Wire } from '$lib/wire/wire.svelte'
import type { Connector } from '../connections/connector.svelte'
import type { Dot } from '../connections/dot.svelte'
import { Gate, type GateConstructor } from '../logic-gates/gate.svelte'
import { Templates } from '../logic-gates/templates'
import type { DotPath, StateJSONv1 } from './state-gate-parser'
import State from './state.svelte'

/**
 * Type alias for {@link StateJSONv1} stringified
 */
export type StateString = string

/**
 * Copies
 * @param gateList
 * @returns
 */
export function copy(gateList: Gate<any, any>[], wireList: Wire[]): StateString {
	const reverse = new Map(gateList.map((gate, id) => [gate, id]))

	function getDotPath(dot: Dot): [gate: number, connector: number] {
		const parentGate = dot.parent
		if (!parentGate) {
			console.error(dot)
			throw new Error(`Connector has no parent gate`)
		}
		const connectorID = parentGate.dots.indexOf(dot)
		const parentID = reverse.get(dot.parent)
		if (parentID === undefined) {
			console.error(dot)
			throw new Error(`Parent ID not working`)
		}
		return [parentID, connectorID]
	}

	const gates = gateList.map((gate) => {
		return {
			template: gate.template,
			position: gate.position.toArr()
		}
	})

	const wires: [from: DotPath, to: DotPath][] = wireList.map((wire) => {
		return [getDotPath(wire.from), getDotPath(wire.to)]
	})

	const final: StateJSONv1 = {
		version: 1,
		gates,
		wires
	}
	return JSON.stringify(final, (key, value) => {
		if (typeof value === 'function') {
			return value.toString()
		}
		return value
	})
}

export function paste(tplStr: StateString) {
	const tpl = JSON.parse(tplStr, (key, value) => {
		if (typeof value === 'string' && value.substring(0, 8) === 'function(') {
			// This is an eval-like feature, and should be used cautiously
			return new Function('return ' + value)()
		}
		return value
	}) as StateJSONv1
	const newGates = tpl.gates.map(({ template, position }) => {
		const vec = Vec.fromArr(position)
		if (typeof template === 'string') {
			if (template in Templates) {
				const temp = Templates[template as keyof typeof Templates]({ vec, name: '' })
				return State.add(new Gate(temp as GateConstructor<any, any>))
			} else {
				throw new Error('Template not recognised: ' + template)
			}
		} else {
			return State.add(new Gate(template))
		}
	})

	for (let [[fromGate, fromDot], [toGate, toDot]] of tpl.wires) {
		State.createWire(newGates[fromGate].dots[fromDot], newGates[toGate].dots[toDot])
	}

	return newGates
}

// @ts-expect-error
globalThis.copy = copy
// @ts-expect-error
globalThis.paste = paste
// @ts-expect-error
globalThis.getAllGates = () => [...State.pieces].filter((r) => r instanceof Gate)
