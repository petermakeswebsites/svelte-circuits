<script lang="ts">
	import { And } from '$lib/and.svelte'
	import { Gate } from '$lib/gate.svelte'
	import { Junction } from '$lib/junction.svelte'
	import { Or } from '$lib/or.svelte'
	import { Source } from '$lib/source.svelte'
	import type { Piece } from '$lib/state.svelte'
	import { Switcher } from '$lib/switcher.svelte'
	import AndView from './AndView.svelte'
	import GateView from './GateView.svelte'
	import JunctionView from './JunctionView.svelte'
	import OrView from './OrView.svelte'
	import SourceView from './SourceView.svelte'
	import SwitcherView from './SwitcherView.svelte'

	let { item }: { item: Piece } = $props()
</script>

{#if item instanceof Junction}
	<JunctionView junction={item} />
{:else if item instanceof Switcher}
	<SwitcherView switcher={item} />
{:else if item instanceof Source}
	<SourceView source={item} />
{:else if item instanceof And}
	<AndView and={item} />
{:else if item instanceof Or}
	<OrView or={item} />
{:else if item instanceof Gate}
	<GateView gate={item} />
{/if}
