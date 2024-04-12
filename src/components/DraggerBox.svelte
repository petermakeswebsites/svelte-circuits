<script lang="ts">
	import { dragger } from '$lib/dragger.svelte'
	import { focuslink } from '$lib/focus-link'
	import { Hotkeys } from '$lib/hotkeys.svelte'
	import { Position } from '$lib/position.svelte'
	import { Selectable } from '$lib/selectable.svelte'
	import { fade } from 'svelte/transition'

	let {
		// x = 0,
		// y = 0,
		width = 0,
		height = 0,
		dragPosition,
		selectable,
		onNonDraggingClick = null
	}: {
		// x: number
		// y: number
		width: number
		height: number
		dragPosition: Position
		selectable: Selectable
		onNonDraggingClick?: null | (() => void)
	} = $props()
	
let x = $derived(-width/2)
let y = $derived(-height/2)
</script>

<g
	use:focuslink={(focussed) => (selectable.selected = focussed)}
	use:dragger={{
						begin: (x,y) => {
								 return {
												 x: dragPosition.x - x,
												 y: dragPosition.y - y,
								 }
			},
		abs: (x, y, t) => {
            dragPosition.x = x
            dragPosition.y = y
            if (!Hotkeys.shiftKeyDown) dragPosition.snapTo(10)
        },
		dragcb(dragging) {
			dragging
		},
		tap() {
			selectable?.selectOnly()
			onNonDraggingClick?.()
		}
	}}
>
	<rect {x} {y} {width} {height} rx="15" ry="15" fill="transparent" />
	<rect class="bgrect" {x} {y} {width} {height} rx="5" ry="5" fill="black" />
	<rect
		class:showing={selectable.selected}
		transition:fade
		{x}
		{y}
		{width}
		{height}
		rx="5"
		ry="5"
		fill="#0001"
		stroke-width={2}
		stroke="#0008"
		opacity={0}
	/>
</g>

<style>
    g:hover {
        cursor: move;
    }

    .showing {
        opacity: 1;
    }

    .bgrect {
        opacity: 0;
        transition: all 0.2s;
    }

    g:focus {
        outline: 0px;
    }

    g:hover .bgrect {
        opacity: 0.1;
    }
</style>
