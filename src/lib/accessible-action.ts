/**
 * use:accessible directive to make an element accessible
 * @param node - The DOM element to enhance
 * @param params - Parameters including the click handler and ARIA label
 */
export function accessible(node : SVGElement, { onclick = () => {}, label } : {onclick? : (evt : Event) => void, label : string}) {
	node.setAttribute('role', 'button')
	node.setAttribute('aria-label', label)
	node.setAttribute('tabindex', '0')

	function handleKeydown(event : KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			onclick(event)
		}
	}

	node.addEventListener('click', onclick)
	node.addEventListener('keydown', handleKeydown)

	return {
		destroy() {
			node.removeEventListener('click', onclick)
			node.removeEventListener('keydown', handleKeydown)
		}
	}
}
