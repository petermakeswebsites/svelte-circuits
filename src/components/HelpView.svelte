<script lang="ts" context="module">
	export const Help = new (class {
		open = $state(false)

		toggle() {
			this.open = !this.open
		}
	})()

	type HelpShortcut = {
		tags: TagName[]
		desc: string
	}

	const actions = [
		{ tags: ['command', 'a'], desc: 'Select all' },
		{ tags: ['command', 'a'], desc: 'Select all' },
		{ tags: ['command', 'x'], desc: 'Cut' },
		{ tags: ['command', 'c'], desc: 'Copy' },
		{ tags: ['command', 'v'], desc: 'Paste' },
		{ tags: ['command', 'z'], desc: 'Undo' },
		{ tags: ['command', 'shift', 'z'], desc: 'Redo' },
		{ tags: ['h'], desc: 'Toggle Help' }
	] satisfies HelpShortcut[]
</script>

<script lang="ts">
	import { fade, scale } from 'svelte/transition'
	import TagMaker from './TagMaker.svelte'
	import type { TagName } from './TagView.svelte'
</script>

{#if Help.open}
	<div class="help" transition:fade>
		<section transition:scale>
			<table>
				<thead>
					<tr>
						<td> Shortcut</td>
						<td>Action</td>
					</tr>
				</thead>
				<tbody>
					{#each actions as { tags, desc }}
						<tr>
							<td class="table-tag">
								<TagMaker {tags} />
							</td>
							<td>
								<span> {desc} </span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	</div>
{/if}

<style>
	section {
		position: fixed;
		background: white;
		padding: 0.5em;
		border-radius: 0.5em;
		left: 50vw;
		top: 50vh;
		translate: -50% -50%;
	}

	.help {
		font-family: sans-serif;
		background: #0003;
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}

	table {
		border-collapse: collapse;
	}

	thead {
		font-weight: bold;
		background-color: #00f1;
	}

	tbody tr {
		border-top: 1px solid black;
	}

	td {
		padding: 0.5em;
		/* height: 2em; */
	}

	tbody tr:nth-child(2n) {
		background: #00000009;
	}

	.table-tag {
		padding-right: 1em;
		text-align: right;
	}
</style>
