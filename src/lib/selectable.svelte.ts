import { Set as StateSet } from 'svelte/reactivity'

export const selectedList = new StateSet<Selectable>()
const selectedArray = $derived([...selectedList])

globalThis.addEventListener('keydown', function (event) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
        // Your code here to handle the delete key press
        selectedArray.forEach(selected => selected._run("delete"))
    }
})


type Actions = {
	delete?: () => void
}

export class Selectable {
	#selected = $state(false)
	public get selected() {
		return this.#selected
	}
	public set selected(value) {
		if (value) {
			selectedList.add(this)
		} else {
			selectedList.delete(this)
		}
		this.#selected = value
	}

	selectOnly() {
        // @ts-ignore
		selectedList.clear()
		this.selected = true
	}

    _run(action : keyof Actions) {
        this.actions[action]?.()
    }

	toggle() {
		this.selected = !this.selected
	}
	constructor(public readonly actions: Actions = {}) {}
}
