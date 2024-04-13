<script lang="ts">
	import { Gate } from '$lib/gate.svelte'
	import { Templates } from '$lib/gates'
	import { Position } from '$lib/position.svelte'
	import { Switcher } from '$lib/switcher.svelte'
	import { untrack } from 'svelte'
	import GateView from './GateView.svelte'
	import Group from './Group.svelte'
	import SwitcherView from './SwitcherView.svelte'
	import State from '$lib/state.svelte'
	import { gridspace } from '$lib/grid'
	import { Selected } from '$lib/selectable.svelte'
	let { contextMenuAt = $bindable() }: { contextMenuAt: null | { x: number; y: number } } = $props()

	const radius = 100

	const display = $derived.by(() => {
		const { junction, ...rest } = Templates
		const entries = Object.entries(rest)
		if (contextMenuAt) {
			return untrack(() => {
				return entries.map(([name, entry], i) => {
					const angle = i * (1 / entries.length) * 2 * Math.PI
					return {
						rendered: entry({
							x: contextMenuAt!.x + Math.cos(angle) * radius,
							y: contextMenuAt!.y + Math.sin(angle) * radius,
							name: 'dummy',
							dummy: true
						}),
						create: (position: Position) => {
							const newbie = State.add(entry({ x: position.x, y: position.y, name: 'dragged' }))
							Selected.clear()
							Selected.select(newbie.selectable)
							contextMenuAt = null
						}
					}
				})
			})
		} else {
			return null
		}
	})
</script>

{#if display && contextMenuAt}
	<rect x={0} y={0} width="100%" height="100%" on:click={() => (contextMenuAt = null)} fill="transparent" />
	<circle cx={contextMenuAt.x} cy={contextMenuAt.y} r={150} fill="#fff"></circle>
	{#each display as entry}
		<Group>
			<GateView gate={entry.rendered} onDrop={entry.create} />
		</Group>
	{/each}
{/if}

<style>
	circle {
		filter: drop-shadow(3px 3px 10px #0002);
	}
</style>
