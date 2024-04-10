import type { Connector } from './connector.svelte'
import { Dot } from './dot.svelte'
import { Selectable } from './selectable.svelte'
import State from './state.svelte'

export class Wire {
	name: string
	from = $state<Dot | null>(null)
	to = $state<Dot | null>(null)
	/**
	 *
	 * @throws
	 */
	constructor({ name = '', from, to }: { name?: string; from: Dot; to: Dot }) {
		this.name = name
		this.from = from
		this.to = to
		if (from.connector.isConnectedTo(to.connector)) {
			throw new Error('Wire is already connected!')
		}
		from.connector.connectTo(to.connector)
	}

	bodyLive = $derived(this.from?.connector.isLive && this.to?.connector.isLive)

	readonly selectable = new Selectable({
		delete: () => {
			State.destroy(this)
		}
	})

	isConnectedTo(dot: Dot) {
		return this.from == dot || this.to == dot
	}

	destroy() {
		console.log('Disconnecting from wire:', this.from?.name, this.to?.name)
		if (this.to) this.from?.connector.disconnectFrom(this.to.connector)
	}
}
