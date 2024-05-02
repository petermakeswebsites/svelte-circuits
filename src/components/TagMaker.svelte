<script lang="ts">
	import TagView from './TagView.svelte'
	import type { TagName } from './TagView.svelte'

	let { tags }: { tags: TagName[] } = $props()
</script>

<span class="hotkeys">
	{#each tags as tag, i}
		{#if i !== 0}
			<span class="hotkeys-plus"> + </span>
		{/if}
		<TagView {tag} />
	{/each}
</span>
<style>
    :global(.hotkeys) {
        font-family: sans-serif;
        vertical-align: middle;
        display: inline-flex;
        align-items: center;
        gap: 2px
    }
    :global(.hotkeys-plus) {
        display: flex;
        align-items: center;
    }
</style>