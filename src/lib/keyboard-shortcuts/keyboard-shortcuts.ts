import { runActionOnSelected, selectAll } from '$lib/selecting/selectable.svelte'
import { StateHistory } from '$lib/state/history.svelte'
import { Help } from '../../components/HelpView.svelte'
import { Hotkeys } from '$lib/utils/hotkeys.svelte'

Hotkeys.add(['Delete', 'Backspace'], () => runActionOnSelected('delete'))

Hotkeys.add(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const, ({ key }) => {
	runActionOnSelected('key', [key, Hotkeys.shiftKeyDown])
})

Hotkeys.add('a', () => Hotkeys.metaKeyDown || Hotkeys.ctrlKeyDown || selectAll())

Hotkeys.add('h', () => Help.toggle())

Hotkeys.add('z', (e) => {
	if (Hotkeys.metaKeyDown || Hotkeys.ctrlKeyDown) {
		e.preventDefault()
		if (Hotkeys.shiftKeyDown) {
			StateHistory.redo()
		} else {
			StateHistory.undo()
		}
	}
})