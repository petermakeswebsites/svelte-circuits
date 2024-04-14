<script lang="ts" generics="T extends number, R extends number">
	import { dragger } from '$lib/selecting/dragger.svelte'
	import DotViewMiddleDot from './DotViewMiddleDot.svelte'
	import DotViewCircles from './DotViewCircles.svelte'
	import { Position } from '$lib/position/position.svelte'
	import Group from './Group.svelte'
	import Path from './Path.svelte'
	import StubbyLine from './StubbyLine.svelte'
	import type { GateConstructor } from '$lib/logic-gates/gate.svelte'

	let { gateConstructor, onDrop }: { gateConstructor: GateConstructor<any, any>; onDrop: (position: Position) => void } = $props()

    let {box, paths, x, y, inputs, outputs} = $derived(gateConstructor)
	let pos = $derived(new Position(x, y))

	// $inspect(gate.bodyLive)
</script>

<Group x={pos.x} y={pos.y}>
	<!-- <Text x={0} y={-10} fontSize="13px">AND</Text> -->
	<rect
		x={-box.width / 2}
		y={-box.height / 2}
		width={box.width}
		height={box.height}
		rx={10}
		fill="#aaf3"
		use:dragger={{
			begin: (x, y, element) => onDrop(pos),
			tap: () => onDrop(pos)
		}}
	>
	</rect>
	<g class="no-pointer-events">
		<g>
			{#each paths as path}
				<g transform="translate(-50%, -50%)">
					<Path live={false} {path} />
				</g>
			{/each}
		</g>
		{#each inputs as input}
			<Group x={input.x} y={input.y}>
				<DotViewCircles />
				<DotViewMiddleDot />
				<StubbyLine direction={input.stub} />
			</Group>
		{/each}
		{#each outputs as output}
			<Group x={output.x} y={output.y}>
				<DotViewCircles />
				<DotViewMiddleDot />
				<StubbyLine direction={output.stub} />
			</Group>
		{/each}
	</g>
</Group>

<style>
	rect {
		cursor: pointer;
	}

	.no-pointer-events {
		pointer-events: none;
	}
</style>
