<script lang="ts">
	import { And } from '$lib/and.svelte'
	import { Junction } from '$lib/junction.svelte'
	import { Or } from '$lib/or.svelte'
	import { selectedList } from '$lib/selectable.svelte'
	import { Source } from '$lib/source.svelte'
	import State from '$lib/state.svelte'
	import { Switcher } from '$lib/switcher.svelte'
	import { Wire } from '$lib/wire.svelte'
	import AndView from '../components/AndView.svelte'
	import { SenderReceiver } from '../components/DotView.svelte'
	import JunctionView from '../components/JunctionView.svelte'
	import OrView from '../components/OrView.svelte'
	import Path from '../components/Path.svelte'
	import SourceView from '../components/SourceView.svelte'
	import SwitcherView from '../components/SwitcherView.svelte'
	import WireView from '../components/WireView.svelte'
	import '$lib/create-start'
	import { Clusters, globalConnectorList } from '$lib/connector.svelte'
	import ContextMenu from '../components/ContextMenu.svelte'
	import PieceSelector from '../components/PieceSelector.svelte'

	let contextMenuAt: null | { x: number; y: number } = $state(null)

	// $inspect(globalConnectorList, "dots")
	$inspect(Clusters.map, 'cluster list update!')
</script>

<svg
	width="100%"
	height="100%"
	on:contextmenu={(evt) => {
		evt.preventDefault()
		contextMenuAt = { x: evt.clientX, y: evt.clientY }
	}}
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

	<rect x={0} y={0} width="100%" height="100%" on:pointerup={() => selectedList.clear()} fill="transparent" />
	{#if SenderReceiver.newLineDrag}
		<g>
			<Path
				live={false}
				path="M {SenderReceiver.newLineDrag.from.position.globalX} {SenderReceiver.newLineDrag.from.position.globalY} L {SenderReceiver
					.newLineDrag.to.globalX} {SenderReceiver.newLineDrag.to.globalY}"
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
		<PieceSelector {item} />
	{/each}

	<ContextMenu bind:contextMenuAt />
</svg>
