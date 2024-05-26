import { Set as StateSet } from 'svelte/reactivity'
import type { KeyboardEventKey } from 'keyboard-event-key-type'

type HotkeyFn<T extends KeyboardEventKey[] = KeyboardEventKey[]> = (e: KeyboardEvent & { key: T[number] }) => void

export const Hotkeys = new (class {
	readonly currentlyDown = new StateSet<KeyboardEventKey>()

	readonly shiftKeyDown = $derived(this.currentlyDown.has('Shift'))
	readonly metaKeyDown = $derived(this.currentlyDown.has('Meta'))
	readonly ctrlKeyDown = $derived(this.currentlyDown.has('Control'))
	#list = new Set<[key: KeyboardEventKey[], fn: HotkeyFn]>()
	#indexed = $derived(
		[...this.#list].reduce((map, [hotkeys, fn]) => {
			for (const hotkey of hotkeys) {
				const fnArr = map.get(hotkey) || [fn]
				map.set(hotkey, fnArr)
			}
			return map
		}, new Map<KeyboardEventKey, HotkeyFn[]>())
	)

	add<T extends KeyboardEventKey[]>(key: T | KeyboardEventKey, e: HotkeyFn<T>) {
		const keyArr : KeyboardEventKey[] = Array.isArray(key) ? [...key] : [key]
		this.#list.add([keyArr, e as HotkeyFn])
	}

	constructor() {}

	attach(w: Window) {
		w.addEventListener('keydown', (evt) => {
			this.currentlyDown.add(evt.key)
			this.#indexed.get(evt.key)?.map(fn => fn(evt))
		})
		w.addEventListener('keyup', (evt) => {
			this.currentlyDown.delete(evt.key)
		})
	}
})()

export const attachHotkeys = Hotkeys.attach.bind(Hotkeys)
