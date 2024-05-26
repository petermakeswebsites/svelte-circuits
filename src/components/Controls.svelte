<script lang="ts">
	import { Clusters } from '$lib/connections/clusters.svelte'
	import { Pulse } from '$lib/state/pulse.svelte'
	import { Help } from './HelpView.svelte'
</script>

<div>
	{#if Pulse.playing}
		<button onclick={() => Pulse.stop()}>
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
				><title>button-pause</title>
				<g fill="#212121" stroke-linecap="round" stroke-linejoin="round">
					<rect x="4" y="4" width="6" height="24" fill="none" stroke="#212121" stroke-width="2"></rect>
					<rect x="20" y="4" width="6" height="24" fill="none" stroke="#212121" stroke-width="2"></rect>
				</g>
			</svg>
		</button>
	{:else}
		<button onclick={() => Pulse.start()}>
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
				><title>button-play</title>
				<g fill="#212121" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="7 29 7 3 28 16 7 29" fill="none" stroke="#212121" stroke-width="2"></polygon>
				</g>
			</svg>
		</button>
	{/if}

	<button onclick={() => Pulse.step()} class="step" disabled={Pulse.playing} class:ready={!Pulse.playing && Pulse.readyForNextPulse}>
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
			<title>step</title>
			<g fill="#212121" stroke-linecap="round" stroke-linejoin="round">
				<polygon fill="none" stroke="#212121" stroke-width="2" points="4,29 4,3 23,16 "></polygon>
				<line fill="none" stroke="#212121" stroke-width="2" x1="28" y1="2" x2="28" y2="30"></line>
			</g>
		</svg>
	</button>

	<button onclick={() => Clusters.reset()}>
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
			><title>curved-arrow-left</title>
			<g fill="#212121" stroke-linecap="round" stroke-linejoin="round">
				<path fill="none" stroke="#212121" stroke-width="2" d="M2,22h18.5 c5.247,0,9.5-4.253,9.5-9.5v0C30,7.253,25.747,3,20.5,3H11" />
				<polyline fill="none" stroke="#212121" stroke-width="2" points="10,14 2,22 10,30 "></polyline>
			</g>
		</svg>
	</button>

	<button onclick={() => Help.toggle()}>
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
			><title>question-mark</title>
			<g fill="#212121" stroke-linecap="round" stroke-linejoin="round">
				<circle data-stroke="none" cx="16" cy="29" r="1" fill="#212121" stroke="none"></circle>
				<circle cx="16" cy="29" r="1" fill="none" stroke="#212121" stroke-width="2"></circle>
				<path d="M8.667,3.2A18.751,18.751,0,0,1,17,1c5.5,0,8,3,8,7.333C25,15,16,16,16,23" fill="none" stroke="#212121" stroke-width="2" />
			</g>
		</svg>
	</button>
</div>

<style>
	.step {
		opacity: 0.6;
		&[disabled] {
            opacity: 0.4;
		}
		&.ready {
            opacity: 1;
            filter: drop-shadow(0 0 4px #88f);
		}
	}

	div {
		/* background: white; */
		padding: 0.5em;
		border-radius: 1em;
		/* box-shadow: 1px 2px 15px #0003; */
		position: fixed;
		right: 1em;
		display: flex;
		gap: 10px;
		top: 1em;
	}

	button {
		background: white;
		color: inherit;
		font: inherit;
		cursor: pointer;
		outline: inherit;
		border: 1px solid #eee;
		border-radius: 5px;
		padding: 2px;
		margin: 0;
		display: flex;

	}
</style>
