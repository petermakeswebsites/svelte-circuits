<script lang="ts">
	import { Gate, type GateConstructor } from '$lib/logic-gates/gate.svelte'
	import { Templates } from '$lib/logic-gates/templates'
	import { Position } from '$lib/position/position.svelte'
	import { Switcher } from '$lib/logic-gates/switcher.svelte'
	import { untrack } from 'svelte'
	import GateView from './GateView.svelte'
	import Group from './Group.svelte'
	import SwitcherView from './SwitcherView.svelte'
	import State from '$lib/state/state.svelte'
	import { gridspace } from '$lib/constants/grid'
	import { Selected } from '$lib/selecting/selectable.svelte'
	import GateTemplateView from './GateTemplateView.svelte'
	import { Vec } from '$lib/position/vec'
	import { accessible } from '$lib/utils/accessible-action'
	let { contextMenuAt = $bindable() }: { contextMenuAt: null | Vec } = $props()

	const radius = 100

	const display = $derived.by(() => {
		const { junction, ...rest } = Templates
		const entries = Object.entries(rest)
		if (contextMenuAt) {
			return untrack(() => {
				return entries.map(([name, entry], i) => {
					const angle = i * (1 / entries.length) * 2 * Math.PI
					return {
						rendered: entry({
							vec: contextMenuAt!.add(Vec.fromPolar(angle, radius)),
							name: 'dummy',
							dummy: true
						}),
						create: (position: Position) => {
							const newbie = State.add(new Gate(entry({ vec: position.global, name: 'dragged' }) as GateConstructor<any, any>))
							Selected.clear()
							Selected.select(newbie.selectable)
							Selected.beginMove(position.vec)
							contextMenuAt = null
						}
					}
				})
			})
		} else {
			return null
		}
	})
</script>

{#if display && contextMenuAt}
	<g data-testid="contextmenu">
		<rect
			x={0}
			y={0}
			use:accessible={{ label: 'backdrop', onclick: () => (contextMenuAt = null) }}
			width="100%"
			height="100%"
			fill="transparent"
		/>
		<circle cx={contextMenuAt.x} cy={contextMenuAt.y} r={150} fill="#fff"></circle>
		{#each display as entry}
			<g>
				<GateTemplateView gateConstructor={entry.rendered} onDrop={entry.create} />
			</g>
		{/each}
	</g>
{/if}

<style>
	circle {
		filter: drop-shadow(3px 3px 10px #0002);
	}
</style>
