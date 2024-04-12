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
					arr.length ? arr[0] : State.add(Templates.junction({ x: this.newLineDrag.to.globalX, y: this.newLineDrag.to.globalY, name: "junc" })).inputs[0]
				)
			} catch (e) {
				console.log('Error creating wire!')
			}
		}

		updateDragPosition(from: Dot, to: Position) {
			this.newLineDrag = {
				from,
				to: to.copy.snapTo(10)
			}
		}

		processSending() {
			this.#createWire()
			this.newLineDrag = null
		}
	})()
</script>

<script lang="ts">
	import { Dot } from '$lib/dot.svelte'
	import { dragger } from '$lib/dragger.svelte'
	import { Position } from '$lib/position.svelte'
	import { Set as StateSet } from 'svelte/reactivity'
	import Group from './Group.svelte'
	import State from '$lib/state.svelte'
	import { Templates } from '$lib/gates'
	let { dot, disabled = false }: { dot: Dot; disabled?: boolean } = $props()
	let hovering = $derived(SenderReceiver.newLineDrag ? dot.position.isWithinDistanceOf(SenderReceiver.newLineDrag.to, 10) : null)

	if (!disabled)
		$effect(() => {
			if (hovering) {
				SenderReceiver.hoveringList.add(dot)
			} else {
				SenderReceiver.hoveringList.delete(dot)
			}
		})
</script>

<Group x={dot.position.x} y={dot.position.y}>
	{#if disabled}
		<circle class="mouse-over" cx={0} cy={0} r="10" fill={'transparent'} fill-opacity={0.2} />
		<circle class="expander" cx={0} cy={0} r="0" fill={'blue'} fill-opacity={0.2} />
	{:else}
		<g
			class:receiving={hovering}
			use:dragger={{
				relative(x, y) {
					const newPosition = dot.position.popToGlobal().move(x, y)
					SenderReceiver.updateDragPosition(dot, newPosition)
				},
				begin() {},
				end() {
					SenderReceiver.processSending()
				}
			}}
		>
			<circle class="mouse-over" cx={0} cy={0} r="10" fill={'transparent'} fill-opacity={0.2} />
			<circle class="expander" cx={0} cy={0} r="0" fill={'blue'} fill-opacity={0.2} />
		</g>
	{/if}
	<circle class="show" cx={0} cy={0} r="5" fill={dot.connector.isLive ? 'green' : 'grey'} />
</Group>

<style>
	circle.show {
		pointer-events: none;
	}

	.expander {
		transition: all 0.2s;
		cursor: pointer;
	}
	g:hover .expander,
	g.receiving .expander {
		r: 10;
	}
</style>
