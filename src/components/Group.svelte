<script lang="ts">
	import type { Snippet } from "svelte"

    type Props = {x : number, y : number, children : Snippet}
	let {x,y, children} : Props = $props()
</script>

<g transform={`translate(${x}, ${y})`} >
	{@render children()}
</g>
