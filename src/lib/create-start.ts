import { And } from "./and.svelte"
import { Templates } from "./gates"
import { Or } from "./or.svelte"
import { Source } from "./source.svelte"
import State from "./state.svelte"
import { Switcher } from "./switcher.svelte"
import { Wire } from "./wire.svelte"

setTimeout(() => {
	State.add(Templates.and({x: 200, y:300, name: "andy"}))
	State.add(Templates.or({x: 300, y:300, name: "aura"}))
	State.add(Templates.xor({x: 300, y:400, name: "xim"}))
	State.add(Templates.nor({x: 200, y:400, name: "nora"}))
	State.add(Templates.nand({x: 100, y:400, name: "nando"}))
	State.add(Templates.xnor({x: 100, y:300, name: "xnor"}))
	State.add(Templates.not({x: 100, y: 500, name: "not" }))
	State.add(Templates.junction({x: 200, y: 500, name: "junc" }))
	// const x = State.add(new Junction({ x: 70, y: 50, name: 'bob-top' }))
	// const y = State.add(new Junction({ x: 30, y: 300, name: 'sandra-bottom' }))
	const so = State.add(new Source({ x: 300, y: 500, name: 'sourcey' }))
    // State.createWire(so.dot,y.joint, "sandra-source")
    // State.createWire(so.dot,x.joint, "bob-source")
	// const sw = State.add(new Switcher({ x: 90, y: 40, name: 'steve' }))
    // const ad = State.add(new And({x: 150,y: 150, name: "andy"}))
    // const or = State.add(new Or({x: 150,y: 250, name: "oreo"}))
	// State.add(new Wire({ to: sw.from, from: so.dot }))
})