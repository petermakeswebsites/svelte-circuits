<script lang="ts">
	import { And } from "$lib/and.svelte"
	import { Junction } from "$lib/junction.svelte"
	import { Or } from "$lib/or.svelte"
	import { Source } from "$lib/source.svelte"
	import type { Piece } from "$lib/state.svelte"
	import { Switcher } from "$lib/switcher.svelte"
	import { onDestroy, onMount } from "svelte"
	import AndView from "./AndView.svelte"
	import JunctionView from "./JunctionView.svelte"
	import OrView from "./OrView.svelte"
	import SourceView from "./SourceView.svelte"
	import SwitcherView from "./SwitcherView.svelte"
    import { blockList } from '$lib/blocks'
	import { Position } from "$lib/position.svelte"

    type SetType<T extends Set<any>> = T extends Set<infer U> ? U : never;
	let { cons, parentPos = new Position(0,0) }: { cons: SetType<typeof blockList>, parentPos : Position } = $props()
    let item : InstanceType<typeof cons> | null = $state(null)
    onMount(() => {
        item = new cons({x: parentPos.x, y: parentPos.y})
    })

    onDestroy(() => {
        item?.destroy()
    })
</script>

{#if item instanceof Junction}
	<JunctionView junction={item} disabled />
{:else if item instanceof Switcher}
	<SwitcherView switcher={item} disabled />
{:else if item instanceof Source}
	<SourceView source={item} disabled />
{:else if item instanceof And}
	<AndView and={item} disabled />
{:else if item instanceof Or}
	<OrView or={item} disabled />
{/if}
