<script lang="ts">
	import { blockList } from '$lib/blocks'
	import { Position } from '$lib/position.svelte'
	import Group from './Group.svelte'
	import PieceSelectorTransient from './PieceSelectorTransient.svelte'
	let { contextMenuAt = $bindable() }: { contextMenuAt: null | { x: number; y: number } } = $props()

	$inspect(contextMenuAt)
	const list = [...blockList].map((item, i) => {
		return {
			angle: i * (1 / blockList.size) * 2 * Math.PI,
			item
		}
	})
	const radius = 100

	console.log(list.map((r) => r.angle))
</script>

{#if contextMenuAt}
	<rect x={0} y={0} width="100%" height="100%" on:click={() => (contextMenuAt = null)} fill="transparent" />
	<circle cx={contextMenuAt.x} cy={contextMenuAt.y} r={150} fill="#fff"></circle>
	{#each list as item}
		{@const x = Math.cos(item.angle) * radius}
		{@const y = Math.sin(item.angle) * radius}
		{@const parentPos = new Position(x + contextMenuAt.x, y + contextMenuAt.y)}
		<Group>
			<PieceSelectorTransient cons={item.item} {parentPos} />
		</Group>
	{/each}
{/if}

<style>
	circle {
		filter: drop-shadow( 3px 3px 10px #0002);

	}
</style>
