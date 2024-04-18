import { Vec } from '$lib/position/vec'
import { ZoomScroll } from '$lib/view-navigation.ts/scroll-zoom.svelte'

const LONG_TAP_MS = 400

type FnList<T> = {
	/**
	 * Return some info you want passed to the move function
	 * useful for initial positions, to get deltas
	 * @returns
	 */
	begin?: (pos: Vec, element?: SVGElement) => T
	move?: (options: { delta: Vec; rel: Vec; abs: Vec; extra: T | undefined }) => void
	dragcb?: (dragging: boolean) => void
	end?: (pos: Vec) => void
	/**
	 * Non-dragging tap
	 * @returns
	 */
	tap?: (pos: Vec) => void
	longtap?: (pos: Vec) => void
	applyZoomTransforms?: boolean
}
export function dragger<T>(
	element: SVGElement,
	{ begin: beginFn, move: moveFn, dragcb, end, tap, longtap, applyZoomTransforms = true }: FnList<T>
) {
	let dragging = false
	let isDown = false

	// let customOffset = new Vec()

	let extra: T | undefined

	let longtapTimer: ReturnType<typeof setTimeout> = -1
	let longtapped = false
	function cancelLongtap() {
		clearTimeout(longtapTimer)
	}

	let last = new Vec()
	let first = new Vec()
	let beginReset = true

	/**
	 *
	 * @param {PointerEvent} evt
	 */
	function down(evt: PointerEvent) {
		isDown = true
		const evtVec = new Vec(evt.x, evt.y)
		deltaAccumulator = new Vec()

		if (longtap)
			longtapTimer = setTimeout(() => {
				longtap?.(evtVec)
				longtapped = true
			}, LONG_TAP_MS)

		element.setPointerCapture(evt.pointerId)
		last = applyZoomTransforms ? ZoomScroll.inverseMatrix.applyToVec(evtVec) : evtVec
		first = last
	}

	let nextMove: ReturnType<typeof requestAnimationFrame> = -1
	let pendingNextFrame = false
	function cancelPendingFrame() {
		pendingNextFrame = false
		cancelAnimationFrame(nextMove)
	}

	let deltaAccumulator = new Vec()
	function move(evt: PointerEvent) {
		if (!isDown) return
		evt.preventDefault()

		cancelLongtap()
		if (longtapped) return

		const evtVec = new Vec(evt.x, evt.y)
		const transformedEvtVec = applyZoomTransforms ? ZoomScroll.inverseMatrix.applyToVec(evtVec) : evtVec

		// This is when the true beginning actually fires
		if (beginReset) {
			const rtn = beginFn?.(transformedEvtVec, element)
			extra = rtn
			beginReset = false
		}

		dragging = true
		dragcb?.(true)

		const thisDelta = transformedEvtVec.subtract(last)
		deltaAccumulator = deltaAccumulator.add(thisDelta)
		last = transformedEvtVec

		if (pendingNextFrame) {
			console.log('Dropping unnecessary move')
			return
		}


		pendingNextFrame = true
		nextMove = requestAnimationFrame(() => {
			pendingNextFrame = false
			const delta = deltaAccumulator
			deltaAccumulator = new Vec()
			const abs = transformedEvtVec
			const rel = transformedEvtVec.subtract(first)
			moveFn?.({ abs, delta, rel, extra })
		})
	}

	function up(evt: PointerEvent) {
		element.releasePointerCapture(evt.pointerId)
		cancelPendingFrame()
		cancelLongtap()
		const evtVec = applyZoomTransforms ? ZoomScroll.inverseMatrix.applyToVec(new Vec(evt.x, evt.y)) : new Vec(evt.x, evt.y)
		if (!dragging) {
			if (isDown && !longtapped) tap?.(evtVec)
		} else {
			beginReset = true
			if (end) end(evtVec)

			dragging = false
			dragcb?.(false)
		}
		longtapped = false
		isDown = false
	}

	element.addEventListener('pointerdown', down)
	element.addEventListener('pointermove', move)
	element.addEventListener('pointerup', up)
	element.addEventListener('pointercancel', up)

	return {
		destroy() {
			element.removeEventListener('pointerdown', down)
			element.removeEventListener('pointermove', move)
			element.removeEventListener('pointerup', up)
			element.removeEventListener('pointercancel', up)
		}
	}
}
