import { Dot } from './dot.svelte'
import { TwoInOneOut } from './primitives.svelte'

export interface AndMeta {
    type: "AND",
    name : string
}

export class And extends TwoInOneOut {
	constructor({ x = 0, y = 0, name = 'and' }) {
		super({ x, y, name, calculation: () => {
            console.log("Culculehting!", this.input1.connector.isLive, this.input2.connector.isLive)
            return this.input1.connector.isLive && this.input2.connector.isLive
        } })
	}

    encode() {
        return {
            meta: {
                type: "AND",
                name: this.name,
            },
            connections: this.dots
        }
    }
}
