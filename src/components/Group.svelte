<script lang="ts">
	import type { Vec } from '$lib/position/vec'
	import type { Snippet } from 'svelte'
	import type { SVGAttributes, SvelteHTMLElements } from 'svelte/elements'
	interface Props extends Omit<SvelteHTMLElements['g'], 'transform'> {
		pos: Vec
		children : Snippet
	}
	let { pos, children, ...rest }: Props = $props()
</script>

<g transform={`translate(${pos.x}, ${pos.y})`} {...rest}>
	{@render children()}
</g>