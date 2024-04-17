import { copy, paste, type StateString } from './copy-paste'
import { Gate } from '../logic-gates/gate.svelte'
import State from './state.svelte'
import { tick } from 'svelte'
import { playBeep } from '$lib/audio/beep'

class HistoryNode<T> {
	previousNode?: HistoryNode<T>
	readonly data: T
	constructor(data: T, from?: HistoryNode<T>) {
		this.previousNode = from
		this.data = data
	}

	nextNodes: HistoryNode<T>[] = []
	selectedNextNode?: HistoryNode<T>

	addAndSelectNode(node: HistoryNode<T>) {
		this.nextNodes.push(node)
		this.selectedNextNode = node
	}
}

export const StateHistory = new (class {
	undoAvailable = $state(false)
	redoAvailable = $state(false)

	#ptr?: HistoryNode<StateString>
	states: string[] = []
	#timeout: ReturnType<typeof requestIdleCallback> = -1
	#disableSaving = false
	saveWhenIdle() {
		clearTimeout(this.#timeout)
		this.#timeout = setTimeout(() => {
			this.saveNow()
		}, 50)
	}

	changePtr(newPtr: HistoryNode<StateString>) {
		this.#ptr = newPtr
		saveHash(newPtr.data)
	}

	saveNow() {
		clearTimeout(this.#timeout)
		const saveString = this.#getSaveString()
		if (this.#ptr?.data === saveString) return // No change
		const newNode = new HistoryNode(saveString, this.#ptr)
		this.#ptr?.addAndSelectNode(newNode)
		this.changePtr(newNode)
	}

	#getSaveString() {
		return copy([...State.pieces], [...State.wires])
	}

	async undo() {
		clearTimeout(this.#timeout)
		if (this.#disableSaving) {
			console.log('Undo in progress')
			return
		}

		console.log('undo')
		const prevNode = this.#ptr?.previousNode
		if (prevNode) {
			this.changePtr(prevNode)
			State.clearState()
			this.#disableSaving = true
			paste(prevNode.data)
			await tick()
			this.#disableSaving = false
		} else {
			playBeep()
			throw new Error('No previous node!')
		}
	}

	async redo() {
		clearTimeout(this.#timeout)
		if (this.#disableSaving) {
			console.log('Undo in progress')
			return
		}
		const nextNode = this.#ptr?.selectedNextNode
		if (!nextNode) {
			playBeep()
			throw new Error(`No next node!`)
		}
		this.changePtr(nextNode)
		State.clearState()
		this.#disableSaving = true
		paste(nextNode.data)
		await tick()
		this.#disableSaving = false
	}

	constructor() {
		// this.#ptr = new HistoryNode(this.#getSaveString())
	}
})()

let internalHashChange = false

function saveHash(str: string) {
	const encodedData = btoa(str)

	// Set the encoded string as the hash (fragment identifier) of the URL
	window.location.hash = encodedData
	internalHashChange = true
}

window.addEventListener('hashchange', function () {
	if (!internalHashChange) {
		// Handle external hash changes here
		console.log('Handling extern')
		paste(atob(window.location.hash.substring(1)))
	} else {
		// Internal change; you might not need to do anything, or:
		console.log('Hash changed internally to:')
	}

	// Reset the flag in case it was set
	internalHashChange = false
})

if (window.location.hash.substring(1)) {
	setTimeout(() => {
		paste(atob(window.location.hash.substring(1)))
	})
}
