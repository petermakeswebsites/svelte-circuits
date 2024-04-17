import { Vec } from '$lib/position/vec'
import { Selected, copySelected, runActionOnSelected, selectAll } from '$lib/selecting/selectable.svelte'
import { copy, paste } from '$lib/state/copy-paste'
import { StateHistory } from '$lib/state/history.svelte'
import State from '$lib/state/state.svelte'
import { Hotkeys } from '$lib/utils/hotkeys.svelte'

globalThis.addEventListener('keydown', function (event) {
	switch (event.key) {
		case 'Delete':
		case 'Backspace':
			runActionOnSelected('delete')
			break
		case 'c':
			if (event.metaKey || event.ctrlKey) {
				event.preventDefault()
				copySelected()
			}
			break
		case 'v':
			if (event.metaKey || event.ctrlKey) {
				this.navigator.clipboard.readText().then((text) => {
					Selected.clear()
					if (text) {
						const ret = paste(text, new Vec(20, 20))
						for (const gate of ret) {
							Selected.select(gate.selectable)
						}
					}
				})
			}
			break
		case 'a':
			if (event.metaKey || event.ctrlKey) {
				selectAll()
			}
			break
		case 'z':
			if (event.metaKey || event.ctrlKey) {
				event.shiftKey
				event.preventDefault()
				if (event.shiftKey) {
                    StateHistory.redo()
				} else {
					StateHistory.undo()
				}
			}
			break
	}
})
