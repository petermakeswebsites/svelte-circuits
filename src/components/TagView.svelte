<script lang="ts" context="module">
	export type TagName = 'command' | 'shift' | 'ctrl' | 'backsapce' | string
</script>

<script lang="ts">
	import { isMac } from '$lib/utils/is-mac'

	let { tag }: { tag: TagName } = $props()
</script>

<span class="hotkey">
	{#if tag === 'command'}
		{isMac ? '⌘' : 'Ctrl'}
	{:else if tag === 'shift'}
		{isMac ? '⇧' : 'Shift'}
	{:else if tag === 'control'}
		{isMac ? '⌃' : 'Ctrl'}
	{:else if tag === 'option'}
		{isMac ? '⌥' : 'Alt'}
	{:else if tag === 'backspace'}
		{isMac ? '⌫' : 'Backspace'}
	{:else}
		{tag.toUpperCase()}
	{/if}
</span>

<style>
	:global(.hotkey) {
		border: 2px solid black;
		border-radius: 5px;
		padding: 0px 5px;
		display: inline-block;
		font-size: small;
	}
</style>
