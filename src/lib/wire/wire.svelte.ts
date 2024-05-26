import type { Dot } from '$lib/connections/dot.svelte'
import { Selectable } from '$lib/selecting/selectable.svelte'
import State from '$lib/state/state.svelte'

export class Wire {
	readonly name: string
	readonly from: Dot
	readonly to: Dot

	/** @throws */
	constructor({ name = '', from, to }: { name?: string; from: Dot; to: Dot }) {
		this.name = name
		this.from = from
		this.to = to
		if (from.connector.isConnectedTo(to.connector)) {
			throw new Error('Wire is already connected!')
		}
	}

	/** Whether the actual wire is live */
	get bodyLive() {
		// To and from are on the same cluster, so we only need to check one
		return this.from.connector.isLive
	}

	readonly selectable = new Selectable({
		delete: () => {
			State.destroy(this)
		}
	})

	/**
	 * Is this wire connected to the dot in question?
	 *
	 * @param dot
	 * @returns Null if nothing, or {@link Dot} of the other end
	 */
	isConnectedTo(dot: Dot): Dot | null {
		return this.from == dot ? this.to : this.to == dot ? this.from : null
	}
}
