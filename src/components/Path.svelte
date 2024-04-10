<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		path,
		live = false,
		strokeOverride = null,
	}: { path: string; live?: Boolean; strokeOverride?: null | boolean } = $props()

	let stroke = $derived((strokeOverride ? strokeOverride : live) ? 'green' : 'grey')
</script>

<path class:live d={path} fill="none" {stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

<style>
	path {
		pointer-events: none;
	}
</style>
