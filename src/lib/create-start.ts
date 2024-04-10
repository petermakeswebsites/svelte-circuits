import { And } from "./and.svelte"
import { Junction } from "./junction.svelte"
import { Or } from "./or.svelte"
import { Source } from "./source.svelte"
import State from "./state.svelte"
import { Switcher } from "./switcher.svelte"
import { Wire } from "./wire.svelte"

setTimeout(() => {
	// const x = State.add(new Junction({ x: 70, y: 50, name: 'bob-top' }))
	// const y = State.add(new Junction({ x: 30, y: 300, name: 'sandra-bottom' }))
	const so = State.add(new Source({ x: 30, y: 50, name: 'sourcey' }))
    // State.createWire(so.dot,y.joint, "sandra-source")
    // State.createWire(so.dot,x.joint, "bob-source")
	// const sw = State.add(new Switcher({ x: 90, y: 40, name: 'steve' }))
    const ad = State.add(new And({x: 150,y: 150, name: "andy"}))
    // const or = State.add(new Or({x: 150,y: 250, name: "oreo"}))
	// State.add(new Wire({ to: sw.from, from: so.dot }))
})