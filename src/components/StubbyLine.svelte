<script lang="ts" context="module">
	export const stubWidth = 10
</script>

<script>
	let {
		x,
		y,
		backwards = false,
		live = false
	}: {
		x: number
		y: number
		backwards?: boolean
		live?: boolean
	} = $props()
</script>

<path d={`M ${x} ${y} l ${backwards ? -stubWidth : stubWidth} 0`} fill="none" stroke={live ? 'green' : 'grey'} stroke-linecap="round" stroke-width="2" />

<style>
	path {
		pointer-events: none;
	}
</style>
