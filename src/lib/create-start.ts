import { Templates } from "./gates"
import State from "./state.svelte"
import { Switcher } from "./switcher.svelte"
import { Wire } from "./wire.svelte"

setTimeout(() => {
	// State.add(Templates.and({x: 200, y:300, name: "andy"}))
	// State.add(Templates.or({x: 300, y:300, name: "aura"}))
	// State.add(Templates.xor({x: 300, y:400, name: "xim"}))
	// State.add(Templates.nor({x: 200, y:400, name: "nora"}))
	// State.add(Templates.nand({x: 100, y:400, name: "nando"}))
	// State.add(Templates.xnor({x: 100, y:300, name: "xnor"}))
	State.add(Templates.not({x: 100, y: 500, name: "not" }))
	// State.add(Templates.junction({x: 200, y: 500, name: "junc" }))
	// State.add(Templates.source({ x: 300, y: 500, name: 'sourcey' }))
})