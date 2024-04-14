<script lang="ts">
	import type { Switcher } from '$lib/logic-gates/switcher.svelte'
	import { Vec } from '$lib/position/vec'
	import DotView from './DotView.svelte'
	import DraggerBox from './DraggerBox.svelte'
	import Group from './Group.svelte'
	import Path from './Path.svelte'
	import StubbyLine from './StubbyLine.svelte'

	let { switcher }: { switcher: Switcher } = $props()
</script>

<Group pos={switcher.position.vec}>
	<DraggerBox
		selectable={switcher.selectable}
		onNonDraggingClick={() => {
			switcher.toggle()
		}}
		dimensions={new Vec(70,40)}
	/>
	<g transform="translate(2, 8)">
		<g class="spinner" class:open={switcher.open}>
			<Path live={!switcher.open} path="M 0 0 l 15 0" />
		</g>
	</g>
	<StubbyLine live={!!switcher.from.connector.isLive} pos={new Vec(-5,10)} />
	<StubbyLine live={!!switcher.to.connector.isLive} pos={new Vec(-5,10)}/>
	<DotView dot={switcher.from} />
	<DotView dot={switcher.to} />
</Group>

<style>
	g.spinner {
		transform: rotate(0deg);
		transition: all 0.2s;
	}

	g.spinner.open {
		transform: rotate(-45deg);
	}
</style>
