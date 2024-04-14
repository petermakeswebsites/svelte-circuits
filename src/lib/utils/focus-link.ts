export function focuslink(node: SVGElement | HTMLElement, cb : (focussed : boolean ) => void) {
	function focus() {
		cb(true)
	}
	function blur() {
		cb(false)
	}

	node.addEventListener('focus', focus)
	node.addEventListener('blur', blur)
	return {
		destroy() {
			node.removeEventListener('focus', focus)
			node.removeEventListener('blur', blur)
		}
	}
}
