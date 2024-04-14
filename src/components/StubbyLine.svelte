<script lang="ts">
	import { StubDirection } from '$lib/connections/dot.svelte'
	import { stubWidth } from '$lib/constants/stub-width'

	let {
		x =0,
		y =0,
		direction = StubDirection.RIGHT,
		live = false
	}: {
		x?: number
		y?: number
		backwards?: boolean
		live?: boolean
		direction?: StubDirection
	} = $props()

</script>

{#if direction !== StubDirection.NONE}
	<path
		d="M {x} {y} l {stubWidth*Math.cos(direction*Math.PI/180)} {stubWidth*Math.sin(direction*Math.PI/180)}"
		transform="rotate()"
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
