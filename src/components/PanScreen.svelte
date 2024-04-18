<script lang="ts">
	import { dragger } from '$lib/selecting/dragger.svelte'
	import { Hotkeys } from '$lib/utils/hotkeys.svelte'
	import { ZoomScroll } from '$lib/view-navigation.ts/scroll-zoom.svelte'
</script>

{#if Hotkeys.currentlyDown.has(' ')}
	<rect width="100%" height="100%" fill="transparent" use:dragger={{
        move({delta}) {
            ZoomScroll.translate(delta.times(-1))
        },
		applyZoomTransforms: false,
    }} />
{/if}

<style>
	rect {
		cursor: move;
	}
</style>
