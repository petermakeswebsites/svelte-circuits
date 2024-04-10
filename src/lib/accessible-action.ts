/**
 * use:accessible directive to make an element accessible
 * @param node - The DOM element to enhance
 * @param params - Parameters including the click handler and ARIA label
 */
export function accessible(node : SVGElement, { onclick = () => {}, label } : {onclick? : (evt : Event) => void, label : string}) {
	// Set ARIA label and tabindex to make the element focusable and informative
	node.setAttribute('role', 'button')
	node.setAttribute('aria-label', label)
	node.setAttribute('tabindex', '0')

	// Function to handle keydown events for accessibility
	function handleKeydown(event : KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			onclick(event)
		}
	}

	// Add event listeners
	node.addEventListener('click', onclick)
	node.addEventListener('keydown', handleKeydown)

	// Cleanup function
	return {
		destroy() {
			node.removeEventListener('click', onclick)
			node.removeEventListener('keydown', handleKeydown)
		}
	}
}
