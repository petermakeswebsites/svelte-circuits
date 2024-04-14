<script lang="ts">
	import { Selected } from '$lib/selecting/selectable.svelte'
	import { Switcher } from '$lib/logic-gates/switcher.svelte'
	import { Wire } from '$lib/wire/wire.svelte'
	import { SenderReceiver } from '../components/DotView.svelte'
	import Path from '../components/Path.svelte'
	import SwitcherView from '../components/SwitcherView.svelte'
	import WireView from '../components/WireView.svelte'
	import '$lib/state/create-start'
	import ContextMenu from '../components/ContextMenu.svelte'
	import GateView from '../components/GateView.svelte'
	import { Gate } from '$lib/logic-gates/gate.svelte'
	import '$lib/state/pulse.svelte'
	import PlayPauseReset from '../components/PlayPauseReset.svelte'
	import "$lib/state/copy-paste"
	import Backdrop from '../components/Backdrop.svelte'
	import { Hotkeys } from '$lib/utils/hotkeys.svelte'
	import State from '$lib/state/state.svelte'
	import { linePath } from '$lib/utils/svg-helpers'
	import { Vec } from '$lib/position/vec'

	let contextMenuAt: null | Vec = $state(null)

	// $inspect(Hotkeys.currentlyDown)

	// $inspect(globalConnectorList, "dots")
	// $inspect(Clusters.map, 'cluster list update!')
</script>

<svg
	width="100%"
	height="100%"
	on:contextmenu={(evt) => {
		evt.preventDefault()
		contextMenuAt = new Vec(evt.clientX, evt.clientY)
	}}
	role="presentation"
>
	<defs>
		<pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
			<path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0002" stroke-width="0.5" />
		</pattern>
		<pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
			<rect width="80" height="80" fill="url(#smallGrid)" />
			<path d="M 80 0 L 0 0 0 80" fill="none" stroke="#0003" stroke-width="1" />
		</pattern>
	</defs>

	<rect width="100%" height="100%" fill="url(#grid)" />
	<Backdrop />
	{#if SenderReceiver.newLineDrag}
		<g>
			<Path
				live={false}
				path={linePath(SenderReceiver.newLineDrag.from.position.global, SenderReceiver.newLineDrag.to.global)}
			/>
		</g>
	{/if}

	{#each State.wires as wire (wire)}
		{#if wire instanceof Wire}
			<WireView {wire} />
		{/if}
	{/each}
	<!-- <Dot /> -->
	{#each State.pieces as item (item)}
		{#if item instanceof Gate}
			<GateView gate={item} />
		<!-- {:else if item instanceof Switcher}
			<SwitcherView switcher={item} /> -->
		{/if}
	{/each}

	<ContextMenu bind:contextMenuAt />
</svg>
<PlayPauseReset />