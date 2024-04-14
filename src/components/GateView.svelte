<script lang="ts" generics="T extends number, R extends number">
	import type { Position } from '$lib/position/position.svelte'

	import DotView from './DotView.svelte'
	import DraggerBox from './DraggerBox.svelte'
	import Group from './Group.svelte'
	import Path from './Path.svelte'
	import StubbyLine from './StubbyLine.svelte'
	import type { Gate } from '$lib/logic-gates/gate.svelte'
	let { gate, onDrop = (position) => {} }: { gate: Gate<T, R>; onDrop?: (position : Position) => void } = $props()

    // $inspect(gate.bodyLive)

</script>

<Group x={gate.position.x} y={gate.position.y}>
	<!-- <Text x={0} y={-10} fontSize="13px">AND</Text> -->
	<DraggerBox selectable={gate.selectable} dragPosition={gate.position} width={gate.box.width} height={gate.box.height} {onDrop} />
	<g>
		{#each gate.paths as path}
			<g transform="translate(-50%, -50%)">
				<Path live={gate.bodyLive && !gate.dummy} {path} />
			</g>
		{/each}
	</g>
	{#each gate.inputs as input}
		<DotView dot={input} />
		<StubbyLine direction={input.stub} live={!!input.connector.isLive} x={input.position.x} y={input.position.y} />
	{/each}
	{#each gate.outputs as output}
		<DotView dot={output} />
		<StubbyLine direction={output.stub} live={!!output.connector.isLive && !gate.dummy} x={output.position.x} y={output.position.y} />
	{/each}
</Group>
