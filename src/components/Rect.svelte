<script lang="ts">
	import type { Box } from '$lib/selecting/box'
	import type { SVGAttributes, SvelteHTMLElements } from 'svelte/elements'
	interface Props extends Omit<SvelteHTMLElements['rect'], 'x' | 'y' | 'width' | 'height'> {
		box: Box
	}
	let { box, ...rest }: Props = $props()
</script>

<rect x={box.from.x} y={box.from.y} width={box.dimensions.x} height={box.dimensions.y} {...rest} />
