import { Vec } from '$lib/position/vec'
import { ZoomScroll } from '$lib/view-navigation.ts/scroll-zoom.svelte'

type FnList<T> = {
	/**
	 * Return some info you want passed to the move function
	 * useful for initial positions, to get deltas
	 * @returns
	 */
	begin?: (pos: Vec, element?: SVGElement) => T
	move?: (options : {delta : Vec, rel: Vec, abs: Vec, extra : T | undefined}) => void
	// delta?: (delta: Vec) => void
	// relative?: (rel: Vec) => void
	// abs?: T extends undefined ? (abs: Vec) => void : (abs: Vec, extra: T) => void
	dragcb?: (dragging: boolean) => void
	end?: (pos: Vec) => void
	/**
	 * Non-dragging tap
	 * @returns
	 */
	tap?: (pos : Vec) => void
	applyZoomTransforms? : boolean
}
export function dragger<T>(
	element: SVGElement,
	{ begin: beginFn, move: moveFn, dragcb, end, tap, applyZoomTransforms = true }: FnList<T>
) {
	let dragging = false
	let isDown = false

	// let customOffset = new Vec()

	let extra: T | undefined

	let last = new Vec()
	let first = new Vec()
	let beginReset = true
	/**
	 *
	 * @param {PointerEvent} evt
	 */
	function down(evt: PointerEvent) {
		isDown = true
		element.setPointerCapture(evt.pointerId)
		last = applyZoomTransforms ? ZoomScroll.inverseMatrix.applyToVec(new Vec(evt.x, evt.y)) : new Vec(evt.x, evt.y)
		first = last
	}

	let nextMove : ReturnType<typeof requestAnimationFrame> = -1
	let pendingNextFrame = false
	function move(evt: PointerEvent) {
		if (!isDown) return
		const evtVec = applyZoomTransforms ? ZoomScroll.inverseMatrix.applyToVec(new Vec(evt.x, evt.y)) : new Vec(evt.x, evt.y)

		// This is when the true beginning actually fires
		if (beginReset) {
			const rtn = beginFn?.(evtVec, element)
			extra = rtn
			beginReset = false
		}

		dragging = true
		dragcb?.(true)

		last = evtVec
		// absFn?.(evtVec.add(customOffset), extra as T)
		// deltaFn?.(delta.add(customOffset))
		// relativeFn?.(evtVec.subtract(first).subtract(customOffset))
		if (pendingNextFrame) {
			console.log("Dropping unnecessary move")
			return
		}
		pendingNextFrame = true
		nextMove = requestAnimationFrame(() => {
			pendingNextFrame = false
			const delta = evtVec.subtract(last)
			const abs = evtVec
			const rel = evtVec.subtract(first)
			moveFn?.({abs,delta,rel,extra})
		})
	}

	function up(evt: PointerEvent) {
		element.releasePointerCapture(evt.pointerId)
		if (pendingNextFrame) {
			cancelAnimationFrame(nextMove)
			pendingNextFrame = false
		}
		const evtVec = applyZoomTransforms ? ZoomScroll.inverseMatrix.applyToVec(new Vec(evt.x, evt.y)) : new Vec(evt.x, evt.y)
		if (!dragging) {
			if (isDown) tap?.(evtVec)
			isDown = false
			return
		}
		isDown = false
		beginReset = true
		if (end) end(evtVec)

		dragging = false
		dragcb?.(false)
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
