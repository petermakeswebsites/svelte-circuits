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
	import '$lib/state/copy-paste'
	import Backdrop from '../components/Backdrop.svelte'
	import { Hotkeys } from '$lib/utils/hotkeys.svelte'
	import State from '$lib/state/state.svelte'
	import { linePath } from '$lib/utils/svg-helpers'
	import { Vec } from '$lib/position/vec'
	import { ZoomScroll } from '$lib/view-navigation.ts/scroll-zoom.svelte'
	import '$lib/keyboard-shortcuts/keyboard-shortcuts'
	import Rect from '../components/Rect.svelte'
	import { Box } from '$lib/selecting/box'

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
	<Backdrop />
	<g transform="{ZoomScroll.matrix.cssTransform}">
	{#if SenderReceiver.newLineDrag}
		<g>
			<Path live={false} path={linePath(SenderReceiver.newLineDrag.from.position.global, SenderReceiver.newLineDrag.to.global)} />
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
	</g>
	<ContextMenu bind:contextMenuAt />
</svg>
<PlayPauseReset />
