<script lang="ts" generics="T extends number, R extends number">
	import type { Position } from '$lib/position/position.svelte'

	import DotView from './DotView.svelte'
	import DraggerBox from './DraggerBox.svelte'
	import Group from './Group.svelte'
	import Path from './Path.svelte'
	import StubbyLine from './StubbyLine.svelte'
	import type { Gate } from '$lib/logic-gates/gate.svelte'
	import Source from './Source.svelte'
	let { gate, onDrop = (position) => {} }: { gate: Gate<T, R>; onDrop?: (position : Position) => void } = $props()

    // $inspect(gate.bodyLive)

</script>

<Group pos={gate.position.vec}>
	<!-- <Text x={0} y={-10} fontSize="13px">AND</Text> -->
	{#if gate.template == "source"}
	<Source />
	{/if}
	<DraggerBox selectable={gate.selectable} box={gate.box} {onDrop} />
	<g>
		{#each gate.paths as path}
			<g transform="translate(-50%, -50%)">
				<Path live={gate.bodyLive && !gate.dummy} {path} />
			</g>
		{/each}
	</g>
	{#each gate.inputs as input}
		<DotView dot={input} />
		<StubbyLine direction={input.stub} live={!!input.connector.isLive} pos={input.position.vec} />
	{/each}
	{#each gate.outputs as output}
		<DotView dot={output} />
		<StubbyLine direction={output.stub} live={!!output.connector.isLive && !gate.dummy} pos={output.position.vec}  />
	{/each}
</Group>
