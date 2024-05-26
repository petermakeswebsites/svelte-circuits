<script lang="ts">
	import { accessible } from '$lib/utils/accessible-action'
	import { dragger } from '$lib/selecting/dragger.svelte'
	import type { Wire } from '$lib/wire/wire.svelte'
	import Path from './Path.svelte'
	import { Templates } from '$lib/logic-gates/templates'
	import { Gate } from '$lib/logic-gates/gate.svelte'
	import State from '$lib/state/state.svelte'
	import { focuslink } from '$lib/utils/focus-link'
	import { linePath } from '$lib/utils/svg-helpers'
	let { wire }: { wire: Wire } = $props()
	const drawPath = $derived(linePath(wire.from.position.global, wire.to.position.global))
	let hide = $state(false)
</script>

<g
	class:hide
	use:accessible={{
		label: 'wire: ' + wire.name
	}}
	use:focuslink={(focussed) => (wire.selectable.selected = focussed)}
	use:dragger={{
		begin: (beginVec) => {
			const j = State.add(new Gate(Templates.junction({ vec: beginVec, name: 'new junc' })))
			State.createWire(wire.from, j.getInput(0), 'new 1')
			State.createWire(j.getInput(0), wire.to, 'new 2')
			hide = true
			return j.position
		},
		move: ({abs, extra}) => {
			extra!.set(abs)
			extra!.snapTo()
		},
		end: () => {
			State.destroy(wire) // self-destruct this component
			hide = false
		}
	}}
	class:selected={wire.selectable.selected}
>
	<path class="display-selection" d={drawPath} stroke-linecap="round" stroke-linejoin="round" />

	<Path live={wire.bodyLive} path={drawPath} />
<!--	<Path live={wire.from.connector.isLive && wire.to.connector.isLive} path={drawPath} />-->
	<path d={drawPath} stroke="transparent" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />
</g>

<style>
	g {
		z-index: 0;
		cursor: pointer;
	}

	g.hide {
		opacity: 0.2;
	}

	path.display-selection {
		stroke-width: 0;
		stroke: #00f2;
		transition: all 0.2s;
	}

	g:hover path.display-selection {
		stroke-width: 10;
	}

	g:focus {
		outline: 0px;
	}

	g.selected path.display-selection {
		stroke-width: 12;
		stroke: #0005;
	}
</style>
