import type { Connector } from './connector.svelte'
import type { Dot } from './dot.svelte'
import { Gate, type GateConstructor } from './gate.svelte'
import { Templates } from './gates'
import State from './state.svelte'
/**
 * Numerical representation of a particular {@link Gate} and a particular
 * {@link Dot} within that gate.
 */
type Path = [gate: number, dot: number]

/**
 * Data structure of a saved state
 */
type StateJSONv1 = {
	version: 1,
	gatelist: {
		template: string | GateConstructor<any, any>
		position: readonly [number, number]
	}[]
	wires: [from: Path, to: Path][]
}

/**
 * Copies 
 * @param gates 
 * @returns 
 */
export function copy(gates: Gate<any, any>[]): string {
	const reverse = new Map(gates.map((gate, id) => [gate, id]))
	function getConnectorPath(connector: Connector): [gate: number, connector: number] {
		const parentGate = connector.parent
		if (!parentGate) {
			console.error(connector)
			throw new Error(`Connector has no parent gate`)
		}
		const connectorID = parentGate.dots.map((dot) => dot.connector).indexOf(connector)
		const parentID = reverse.get(connector.parent)
		if (parentID === undefined) {
			console.error(connector)
			throw new Error(`Parent ID not working`)
		}
		return [parentID, connectorID]
	}

	const gatelist = gates.map((gate, id) => {
		return {
			template: gate.template,
			position: gate.position.toArr()
		}
	})

	const wires: [from: Path, to: Path][] = []
	gates
		.flatMap((gate) => gate.dots)
		.map(({ connector }) => {
			// @ts-expect-error 1223
			if (connector.connections.size) {
				const fromPath = getConnectorPath(connector)
				// Always go from lower connection to higher connection, escape otherwise
				// to prevent dupes
				for (const connection of connector.connections) {
					try {
						const toPath = getConnectorPath(connection)
						if (fromPath[0] < toPath[0]) {
							wires.push([fromPath, toPath] as const)
						} else if (fromPath == toPath) {
							if (fromPath[1] < toPath[1]) {
								wires.push([fromPath, toPath] as const)
							}
						}
					} catch(e) {
                        return
                    }
				}
			}
		})

	const final: StateJSONv1 = {
		version: 1,
		gatelist,
		wires
	}
	return JSON.stringify(final, (key, value) => {
		if (typeof value === 'function') {
			return value.toString()
		}
		return value
	})
}

export function paste(tplStr: string) {
	const tpl = JSON.parse(tplStr, (key, value) => {
		if (typeof value === 'string' && value.substring(0, 8) === 'function(') {
			// This is an eval-like feature, and should be used cautiously
			return new Function('return ' + value)()
		}
		return value
	}) as StateJSONv1
	const newGates = tpl.gatelist.map(({ template, position: [x, y] }) => {
		if (typeof template === 'string') {
			if (template in Templates) {
				return State.add(Templates[template as keyof typeof Templates]({ x, y, name: '' }))
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
