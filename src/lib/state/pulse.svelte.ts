import { pulse } from "../connections/clusters.svelte"

export const Playback = new (class {
    HZ = 5
    #timeout = -1
    startLoop() {
        pulse()
        this.#timeout = setTimeout(() => this.startLoop(), 1000/this.HZ)
    }

    playing = $state(true)
    stop() {
        this.playing = false 
        clearTimeout(this.#timeout)
    }

    start() {
        clearTimeout(this.#timeout)
        this.startLoop()
        this.playing = true
    }
    
    constructor() {
        this.startLoop()
    }
})()



// @ts-expect-error
globalThis.pulse = pulse