import { Dot } from "./dot.svelte";
import { Position } from "./position.svelte";
import { Selectable } from "./selectable.svelte";
import State from "./state.svelte";

export class Switcher {
    name = ""
    position = new Position(0,0)
    from = new Dot({name: "switcher from", x: -10, y: 10, parent: this.position})
    to = new Dot({name: "switcher to", x: 30, y: 10, parent: this.position})
    
    #open = $state(true)
    get open() {
        return this.#open
    }

    set open(shouldOpen) {
        if (shouldOpen) {
            this.from.connector.disconnectFrom(this.to.connector)
        } else {
            this.from.connector.connectTo(this.to.connector)
        }
        this.#open = shouldOpen
    }

    toggle() {
        this.open = !this.#open
    }

    readonly selectable = new Selectable({
        delete: () => {
            State.destroy(this)
        }
    })

    constructor({x = 0, y = 0, name = ""}) {
        this.position.x = x
        this.position.y = y
        this.name = name
    }

    get dots() {
        return [this.from, this.to]
    }

    destroy() {
        this.from.destroy()
        this.to.destroy()
    }
}