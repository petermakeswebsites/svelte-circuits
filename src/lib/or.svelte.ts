import { Dot } from './dot.svelte'
import { TwoInOneOut } from './primitives.svelte'

export class Or extends TwoInOneOut {
	constructor({ x = 0, y = 0, name = 'or' }) {
		super({ x, y, name, calculation: () => {
            return this.input1.connector.isLive || this.input2.connector.isLive
        } })
	}
}
