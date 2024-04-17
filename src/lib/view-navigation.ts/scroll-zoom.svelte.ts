import { Vec } from '$lib/position/vec'
import { untrack } from 'svelte'
import { Matrix } from './matrix'

export const ZoomScroll = new (class {
	readonly ZOOM_SCALAR = 0.01
	/**
	 * Take an SVG co-ordinate and convert it into a window co-ordinate For
	 * taking positions of objects and putting them on the screen
	 */
	matrix = $state(new Matrix(1, 0, 0, 1, 0, 0))

	/**
	 * Take a window co-ordinate and convert it into an SVG co-ordinate. For
	 * taking screen things (like mouse location) and converting them into
	 * usable locations for SVGs to go to
	 */
	inverseMatrix = $derived(this.matrix.inverse())


	constructor() {
		document.addEventListener(
			'wheel',
			(e) => {
				e.preventDefault()
				const vec2client = new Vec(e.clientX, e.clientY)
				if (e.ctrlKey) {
					this.matrix = this.matrix.zoomAtPoint(1 + (this.ZOOM_SCALAR * (e.deltaX + e.deltaY)), vec2client)
				} else {
					this.matrix = this.matrix.immodify(vals => {
						vals[4] -= e.deltaX
						vals[5] -= e.deltaY
					})
				}
			},
			{ passive: false }
		)
	}
})()