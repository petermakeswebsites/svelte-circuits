import { Vec } from '$lib/position/vec'
import { Selected, runActionOnSelected, selectAll } from '$lib/selecting/selectable.svelte'
import { copy, paste } from '$lib/state/copy-paste'
import { StateHistory } from '$lib/state/history.svelte'
import State from '$lib/state/state.svelte'
import { Hotkeys } from '$lib/utils/hotkeys.svelte'
import { Help } from '../../components/HelpView.svelte'

globalThis.addEventListener('keydown', function (event) {
	switch (event.key) {
		case 'Delete':
		case 'Backspace':
			runActionOnSelected('delete')
			break
		case 'ArrowLeft':
		case 'ArrowRight':
		case 'ArrowUp':
		case 'ArrowDown':
			runActionOnSelected("key", [event.key, event.shiftKey])
			break
		case 'a':
			if (event.metaKey || event.ctrlKey) {
				selectAll()
			}
			break
		case 'h':
			Help.toggle()
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
