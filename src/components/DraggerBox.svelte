<script lang="ts">
	import { dragger } from '$lib/selecting/dragger.svelte'
	import { focuslink } from '$lib/utils/focus-link'
	import { Hotkeys } from '$lib/utils/hotkeys.svelte'
	import { Position } from '$lib/position/position.svelte'
	import { Draggable, Selectable, Selected } from '$lib/selecting/selectable.svelte'
	import { fade } from 'svelte/transition'

	let {
		width = 0,
		height = 0,
		dragPosition,
		selectable,
		onDrop,
		onNonDraggingClick = null
	}: {
		width: number
		height: number
		dragPosition: Position
		selectable: Draggable
		onDrop?: (position : Position) => void
		onNonDraggingClick?: null | (() => void)
	} = $props()

	let x = $derived(-width / 2)
	let y = $derived(-height / 2)
	// $inspect(Selected.list)
</script>

<g
	use:focuslink={(focussed) => (selectable.selected = focussed)}
	use:dragger={{
		begin: (x,y) => {
			Selected.beginMove(x,y)	
		},
		relative: (x,y) => {
			Selected.move(x,y, selectable)
		},
		tap() {
			selectable?.selectOnly()
			onNonDraggingClick?.()
		},
		end() {
			onDrop?.(selectable.associatedPosition)
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
