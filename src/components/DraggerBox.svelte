<script lang="ts">
	import { dragger } from '$lib/selecting/dragger.svelte'
	import { focuslink } from '$lib/utils/focus-link'
	import { Hotkeys } from '$lib/utils/hotkeys.svelte'
	import { Position } from '$lib/position/position.svelte'
	import { Draggable, Selectable, Selected } from '$lib/selecting/selectable.svelte'
	import { fade } from 'svelte/transition'
	import type { Vec } from '$lib/position/vec'
	import Rect from './Rect.svelte'
	import type { Box } from '$lib/selecting/box'

	let {
		box,
		selectable,
		onDrop,
		onNonDraggingClick = null
	}: {
		box: Box
		selectable: Draggable
		onDrop?: (position: Position) => void
		onNonDraggingClick?: null | (() => void)
	} = $props()

	// $inspect(Selected.list)
</script>

<g
	use:focuslink={(focussed) => (selectable.selected = focussed)}
	use:dragger={{
		begin: (pos) => {
			Selected.beginMove(pos)
		},
		move: ({ rel }) => {
			Selected.move(rel, selectable)
		},
		tap() {
			if (selectable) Selected.selectOnly(selectable)
			onNonDraggingClick?.()
		},
		end() {
			onDrop?.(selectable.associatedPosition)
			Selected.finish()
		}
	}}
>
	<Rect {box} rx="15" ry="15" fill="transparent" />
	<Rect class="bgrect" {box} rx="5" ry="5" fill="black" />
	<g class:showing={selectable.selected} transition:fade>
		<Rect {box} rx="5" ry="5" fill="#0000ff08" stroke-width={2} stroke="#0003" opacity={0} />
	</g>
</g>

<style>
	g:hover {
		cursor: move;
	}

	.showing :global(rect) {
		opacity: 1;
	}

	:global(.bgrect) {
		opacity: 0;
		transition: all 0.2s;
	}

	g:focus {
		outline: 0px;
	}

	g:hover :global(.bgrect) {
		opacity: 0.1;
	}
</style>
