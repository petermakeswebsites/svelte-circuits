<script lang="ts" generics="T extends number, R extends number">
	import DotView from './DotView.svelte'
	import DraggerBox from './DraggerBox.svelte'
	import Group from './Group.svelte'
	import Path from './Path.svelte'
	import StubbyLine from './StubbyLine.svelte'
	import type { Gate } from '$lib/gate.svelte'
	let { gate }: { gate: Gate<T, R> } = $props()

	let allLive = $derived(gate.outputs.every((r) => r.connector.getEmitting()))
</script>

<Group x={gate.position.x} y={gate.position.y}>
	<!-- <Text x={0} y={-10} fontSize="13px">AND</Text> -->
	<DraggerBox
		selectable={gate.selectable}
		dragPosition={gate.position}
		width={gate.box.width}
		height={gate.box.height}
	/>
	<g>
		{#each gate.paths as path}
        <g transform="translate(-50%, -50%)">
			<Path live={allLive} {path} />
        </g>
		{/each}
	</g>
	{#each gate.inputs as input}
		<DotView dot={input} />
		<StubbyLine direction={input.stub} live={input.connector.isLive} x={input.position.x} y={input.position.y} />
	{/each}
	{#each gate.outputs as output}
		<DotView dot={output} />
		<StubbyLine direction={output.stub} live={output.connector.isLive} x={output.position.x} y={output.position.y} />
	{/each}
</Group>
