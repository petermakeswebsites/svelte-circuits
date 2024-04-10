type FnList<T> = {
	/**
	 * Return some info you want passed to the move function
	 * useful for initial positions, to get deltas
	 * @returns
	 */
	begin?: (x: number, y: number, element? : SVGElement) => void | { x?: number; y?: number, extra? : T }
	delta?: (dx: number, dy: number) => void
	relative?: (rx: number, ry: number) => void
	abs?: T extends undefined ? (ax: number, ay: number) => void : (ax: number, ay: number, extra: T) => void
	dragcb?: (dragging: boolean) => void
	end?: () => void
	/**
	 * Non-dragging tap
	 * @returns
	 */
	tap?: () => void
}
export function dragger<T>(element: SVGElement, { begin, delta, relative, abs, dragcb, end, tap }: FnList<T>) {
	let dragging = false
	let isDown = false

	let customOffsetX = 0
	let customOffsetY = 0

	let extra : undefined | T = undefined

	let lastX = 0
	let lastY = 0
	let firstX = 0
	let firstY = 0
	let beginReset = true
	/**
	 *
	 * @param {PointerEvent} evt
	 */
	function down(evt: PointerEvent) {
		isDown = true
		element.setPointerCapture(evt.pointerId)
		lastX = evt.x
		lastY = evt.y
		firstX = lastX
		firstY = lastY
	}

	function move(evt: PointerEvent) {
		if (!isDown) return
		if (beginReset) {
			const rtn = begin?.(evt.x, evt.y, element)
			customOffsetX = rtn?.x || 0
			customOffsetY = rtn?.y || 0
			extra = rtn?.extra || undefined
			beginReset = false
		}

		dragging = true
		dragcb?.(true)

		const deltaX = evt.x - lastX
		const deltaY = evt.y - lastY
		lastX = evt.x
		lastY = evt.y
		abs?.(evt.x + customOffsetX, evt.y + customOffsetY, extra as T)
		delta?.(deltaX + customOffsetX, deltaY + customOffsetY)
		relative?.(evt.x - firstX + customOffsetX, evt.y - firstY + customOffsetY)
	}

	function up(evt: PointerEvent) {
		element.releasePointerCapture(evt.pointerId)
		if (!dragging) {
			if (isDown) tap?.()
			isDown = false
			return
		}
		isDown = false
		beginReset = true
		if (end) end()

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
