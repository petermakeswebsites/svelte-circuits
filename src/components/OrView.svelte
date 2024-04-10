<script lang="ts">
	import { Or } from '$lib/or.svelte'
	import TwoInOneOut from './TwoInOneOut.svelte'
	let { or }: { or: Or} = $props()
</script>

<TwoInOneOut obj={or} path={"M -3 0 l 14 0 C 32 0 39 15 39 15 C 39 15 32 30 11 30 L -3 30 C 4 22 4 8 -3 0"} />
