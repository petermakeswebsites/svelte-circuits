<script lang="ts">
	import { dragger } from '$lib/selecting/dragger.svelte'
	import { Selected, SelectionBox } from '$lib/selecting/selectable.svelte'
	import Rect from './Rect.svelte'
    
</script>

{#if SelectionBox.isOn}
	<Rect
		box={SelectionBox.box}
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
        begin: (v) => {
            Selected.clear()
            SelectionBox.set(v)
        },
        move: ({abs}) => {
            SelectionBox.setTo(abs)
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
