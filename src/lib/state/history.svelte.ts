import { copy, type StateString } from './copy-paste'
import { Gate } from '../logic-gates/gate.svelte'
import State from './state.svelte'

class HistoryNode<T> {
	previousNode?: HistoryNode<T>
	readonly data: T
	constructor(data: T, from?: HistoryNode<T>) {
		this.previousNode = from
		this.data = data
	}
}

export const History = new (class {
	#ptr = $state<HistoryNode<StateString>>()
	states: string[] = []
	#idleCallbackNum: ReturnType<typeof requestIdleCallback> = -1
	saveWhenIdle() {
		cancelIdleCallback(this.#idleCallbackNum)
		requestIdleCallback(() => {
			this.saveNow()
		})
	}

    saveNow() {
        cancelIdleCallback(this.#idleCallbackNum)
        const saveString = this.#getSaveString()
        if (this.#ptr?.data === saveString) return // No change
    }

	#getSaveString() {
		const gates = [...State.pieces].filter((r) => r instanceof Gate) as Gate<any, any>[]
		return copy(gates)
	}

	forward() {

	}

	constructor() {
		this.#ptr = new HistoryNode(this.#getSaveString())
	}
})()
