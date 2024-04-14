import type { Dot } from '$lib/connections/dot.svelte'
import { Selectable } from '$lib/selecting/selectable.svelte'
import State from '$lib/state/state.svelte'

export class Wire {
	name: string
	from = $state<Dot>()!
	to = $state<Dot>()!
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
	}

	bodyLive = $derived(this.from?.connector.isLive && this.to?.connector.isLive)

	readonly selectable = new Selectable({
		delete: () => {
			State.destroy(this)
		}
	})

	/**
	 * Is this wire connected to the dot in question?
	 * @param dot
	 * @returns null if nothing, or {@link Dot} of the other end
	 */
	isConnectedTo(dot: Dot): Dot | null {
		return this.from == dot ? this.to : this.to == dot ? this.from : null
	}
}
