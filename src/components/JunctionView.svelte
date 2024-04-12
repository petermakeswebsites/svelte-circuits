<script lang="ts">
	import { Junction } from '$lib/junction.svelte'
	import DotView from './DotView.svelte'
	import DraggerBox from './DraggerBox.svelte'
	import Group from './Group.svelte'
	let { junction, disabled = false }: { junction: Junction, disabled? : boolean } = $props()
</script>

<g data-name={junction.name}>
	<Group x={junction.position.x} y={junction.position.y}>
		<DraggerBox selectable={junction.selectable} dragPosition={junction.position} x={-15} y={-15} width={30} height={30} />
		<DotView dot={junction.joint} {disabled} />
	</Group>
</g>

<style>
</style>
