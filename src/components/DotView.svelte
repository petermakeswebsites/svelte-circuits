<script context="module" lang="ts">
	export const SenderReceiver = new (class {
		newLineDrag = $state<null | {
			from: Dot
			to: Position
		}>(null)

		hoveringList = new StateSet<Dot>()

		#createWire() {
			if (!this.newLineDrag) return
			const arr = [...this.hoveringList]
			try {
				State.createWire(
					this.newLineDrag.from,
					arr.length
						? arr[0]
						: State.add(new Gate(Templates.junction({vec: this.newLineDrag.to.global, name: 'junc' })))
								.inputs[0]
				)
			} catch (e) {
				console.log('Error creating wire!')
			}
		}

		updateDragPosition(from: Dot, to: Position) {
			this.newLineDrag = {
				from,
				to: to.copy.snapTo().position
			}
		}

		processSending() {
			this.#createWire()
			this.newLineDrag = null
		}
	})()
</script>

<script lang="ts">
	import { Dot } from '$lib/connections/dot.svelte'
	import { dragger } from '$lib/selecting/dragger.svelte'
	import { Position } from '$lib/position/position.svelte'
	import { Set as StateSet } from 'svelte/reactivity'
	import Group from './Group.svelte'
	import State from '$lib/state/state.svelte'
	import { Templates } from '$lib/logic-gates/templates'
	import { Gate } from '$lib/logic-gates/gate.svelte'
	import DotViewMiddleDot from './DotViewMiddleDot.svelte'
	import DotViewCircles from './DotViewCircles.svelte'
	let { dot }: { dot: Dot } = $props()
	let hovering = $derived(SenderReceiver.newLineDrag ? dot.position.isWithinDistanceOf(SenderReceiver.newLineDrag.to, 10) : null)

	$effect(() => {
		if (hovering) {
			SenderReceiver.hoveringList.add(dot)
		} else {
			SenderReceiver.hoveringList.delete(dot)
		}
	})
</script>

<Group pos={dot.position.vec}>
	<g
		class:receiving={hovering}
		use:dragger={{
			move({rel}) {
				const newPosition = dot.position.popToGlobal().move(rel)
				SenderReceiver.updateDragPosition(dot, newPosition)
			},
			end() {
				SenderReceiver.processSending()
			}
		}}
	>
		<DotViewCircles />
	</g>
	<DotViewMiddleDot live={!!dot.connector.isLive} />
</Group>

<style>
	g:hover :global(.expander),
	g.receiving :global(.expander) {
		r: 10;
	}
</style>
