export class Delayer<T> {
    value = $state<T>() as T
    constructor(def : T) {
        this.value = def
    }

    set(v : T) {
        clearTimeout(this.#timeoutID)
        this.value = v
    }

    #timeoutID : ReturnType<typeof setTimeout> = -1

    setDelay(v : T, delay = 200) {
        clearTimeout(this.#timeoutID)
        this.#timeoutID = setTimeout(() => {
            this.value = v
        }, delay)
    }
}