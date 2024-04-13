import { Set as StateSet } from "svelte/reactivity"

export const Hotkeys = new (class {

    currentlyDown = new StateSet<KeyboardEvent["key"]>()

    shiftKeyDown = $derived(this.currentlyDown.has("Shift"))
    metaKeyDown = $derived(this.currentlyDown.has("Meta"))
    ctrlKeyDown = $derived(this.currentlyDown.has("Control"))
    

    constructor() {
        globalThis.addEventListener("keydown", (evt) => {
            this.currentlyDown.add(evt.key)
        })
        globalThis.addEventListener("keyup", (evt) => {
            this.currentlyDown.delete(evt.key)
        })
    }
})()