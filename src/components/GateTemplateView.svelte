<script lang="ts" generics="T extends number, R extends number">
	import Rect from './Rect.svelte'
	import { dragger } from '$lib/selecting/dragger.svelte'
	import DotViewMiddleDot from './DotViewMiddleDot.svelte'
	import DotViewCircles from './DotViewCircles.svelte'
	import { Position } from '$lib/position/position.svelte'
	import Group from './Group.svelte'
	import Path from './Path.svelte'
	import StubbyLine from './StubbyLine.svelte'
	import type { GateConstructor } from '$lib/logic-gates/gate.svelte'

	let { gateConstructor, onDrop }: { gateConstructor: GateConstructor<any, any>; onDrop: (position: Position) => void } = $props()
	let { box, paths, vec, inputs, outputs } = gateConstructor
</script>

<Group pos={vec}>
	<g
		use:dragger={{
			begin: () => onDrop(new Position(vec)),
			tap: () => onDrop(new Position(vec))
		}}
	>
		<Rect {box} rx={10} fill="#aaf3" />
	</g>
	<g class="no-pointer-events">
		<g>
			{#each paths as path}
				<g transform="translate(-50%, -50%)">
					<Path live={false} {path} />
				</g>
			{/each}
		</g>
		{#each inputs as input}
			<Group pos={input.vec}>
				<DotViewCircles />
				<DotViewMiddleDot />
				<StubbyLine direction={input.stub} />
			</Group>
		{/each}
		{#each outputs as output}
			<Group pos={output.vec}>
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
