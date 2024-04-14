<script lang="ts">
	import { dragger } from '$lib/selecting/dragger.svelte'
	import { Selected, SelectionBox } from '$lib/selecting/selectable.svelte'
    
</script>

{#if SelectionBox.isOn}
	<rect
		x={SelectionBox.x}
		y={SelectionBox.y}
		width={SelectionBox.w}
		height={SelectionBox.h}
		fill="#aaf3"
        rx={3}
	/>
{/if}
<rect
	x={0}
	y={0}
	width="100%"
	height="100%"
	use:dragger={{
        begin: (x,y) => {
            console.log("Clearing list!")
            Selected.clear()
            SelectionBox.set(x,y, 0, 0)
        },
        abs: (x,y) => {
            SelectionBox.setSize(x,y)
        },
        end: () => {
            SelectionBox.transfer()
            SelectionBox.done()
        },
		// @ts-expect-error
		tap: () => Selected.list.clear()
	}}
	fill="transparent"
/>
