<script lang="ts">
	import { dragger } from '$lib/selecting/dragger.svelte'
	import { Selected, SelectionBox } from '$lib/selecting/selectable.svelte'
	import { ZoomScroll } from '$lib/view-navigation/scroll-zoom.svelte'
	import Rect from './Rect.svelte'
</script>

<defs>
	<pattern id="smallGrid" width={10} height={10} patternUnits="userSpaceOnUse">
		<path d="M {10} 0 L 0 0 0 {10}" fill="none" stroke="#0002" stroke-width="0.5" />
	</pattern>
	<pattern id="grid" width={80} height={80} patternUnits="userSpaceOnUse" patternTransform={ZoomScroll.matrix.cssTransform}>
		<rect width={80} height={80} fill="url(#smallGrid)" />
		<path d="M {80} 0 L 0 0 0 {80}" fill="none" stroke="#0003" stroke-width="1" />
	</pattern>
</defs>

<rect width="100%" height="100%" fill="url(#grid)" />
{#if SelectionBox.isOn}
	<g transform={ZoomScroll.matrix.cssTransform}>
		<Rect box={SelectionBox.box} fill="#aaf3" rx={3} />
	</g>
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
		move: ({ abs }) => {
			SelectionBox.setTo(abs)
		},
		end: () => {
			SelectionBox.transfer()
			SelectionBox.done()
		},
		tap: () => Selected.list.clear()
	}}
	fill="transparent"
/>
