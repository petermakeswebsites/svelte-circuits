<script lang="ts">
	import { accessible } from '$lib/accessible-action'
	import { dragger } from '$lib/dragger.svelte'
	import { focuslink } from '$lib/focus-link'
	import State from '$lib/state.svelte'
	import type { Wire } from '$lib/wire.svelte'
	import Path from './Path.svelte'
	import { Templates } from '$lib/gates'
	let { wire }: { wire: Wire } = $props()
	const drawPath = $derived(
		`M ${wire.from?.position.globalX} ${wire.from?.position.globalY} L ${wire.to?.position.globalX} ${wire.to?.position.globalY}`
	)
	let hide = $state(false)
</script>

<g
	class:hide
	use:accessible={{
		label: 'wire: ' + wire.name
	}}
	use:focuslink={(focussed) => (wire.selectable.selected = focussed)}
	use:dragger={{
		begin: (x, y, ele) => {
			if (wire.from && wire.to) {
				console.log('begin')
				const j = State.add(Templates.junction({ x, y, name: 'new junc' }))
				State.createWire(wire.from, j.getInput(0), 'new 1')
				State.createWire(j.getInput(0), wire.to, 'new 2')
				hide = true
				return {
					extra: j.position
				}
			}
		},
		abs: (x, y, position) => {
			position.x = x
			position.y = y
			position.snapTo()
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
