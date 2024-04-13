<script lang="ts">
	import { Clusters } from '$lib/connector.svelte'
	import { Playback } from '$lib/pulse.svelte'
</script>

<div>
	{#if Playback.playing}
		<button on:click={() => Playback.stop()}>
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
				><title>button-pause</title><g fill="#212121" stroke-linecap="round" stroke-linejoin="round"
					><rect x="4" y="4" width="6" height="24" fill="none" stroke="#212121" stroke-width="2"></rect>
					<rect x="20" y="4" width="6" height="24" fill="none" stroke="#212121" stroke-width="2"></rect></g
				></svg
			>
		</button>
	{:else}
		<button on:click={() => Playback.start()}>
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
				><title>button-play</title><g fill="#212121" stroke-linecap="round" stroke-linejoin="round"
					><polygon points="7 29 7 3 28 16 7 29" fill="none" stroke="#212121" stroke-width="2"></polygon></g
				></svg
			>
		</button>
	{/if}

	<button on:click={() => Clusters.reset()}>
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
			><title>curved-arrow-left</title><g fill="#212121" stroke-linecap="round" stroke-linejoin="round"
				><path fill="none" stroke="#212121" stroke-width="2" d="M2,22h18.5 c5.247,0,9.5-4.253,9.5-9.5v0C30,7.253,25.747,3,20.5,3H11"></path>
				<polyline fill="none" stroke="#212121" stroke-width="2" points="10,14 2,22 10,30 "></polyline></g
			></svg
		>
	</button>
</div>

<style>
	div {
		/* background: white; */
		padding: 0.5em;
		border-radius: 1em;
		/* box-shadow: 1px 2px 15px #0003; */
		position: fixed;
		right: 1em;
		top: 1em;
	}
	button {
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;
	}
</style>
