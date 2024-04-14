<script lang="ts">
	import { StubDirection } from '$lib/connections/dot.svelte'
	import { stubWidth } from '$lib/constants/stub-width'
	import { Vec } from '$lib/position/vec'
	import { toRad } from '$lib/utils/math'
	import { linePath } from '$lib/utils/svg-helpers'

	let {
		pos = new Vec(),
		direction = StubDirection.RIGHT,
		live = false
	}: {
		pos?: Vec
		backwards?: boolean
		live?: boolean
		direction?: StubDirection
	} = $props()
</script>

{#if direction !== StubDirection.NONE}
	<path
		d={linePath(pos, pos.add(Vec.fromPolar(toRad(direction), stubWidth)))}
		fill="none"
		stroke={live ? 'green' : 'grey'}
		stroke-linecap="round"
		stroke-width="2"
	/>
{/if}

<style>
	path {
		pointer-events: none;
		transform-origin: left;
	}
</style>
