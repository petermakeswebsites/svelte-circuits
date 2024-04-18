<script lang="ts">
	import { Vec } from '$lib/position/vec'
	import { Selected, getSelected, runActionOnSelected } from '$lib/selecting/selectable.svelte'
	import { paste } from '$lib/state/copy-paste'

	function oncopy(e: ClipboardEvent) {
		e.preventDefault()
		e.clipboardData?.setData('text', getSelected())
	}
	function onpaste(e: ClipboardEvent) {
		e.preventDefault()
		const text = e.clipboardData?.getData('text')
		Selected.clear()
		if (text) {
			const ret = paste(text, new Vec(20, 20))
			for (const gate of ret) {
				Selected.select(gate.selectable)
			}
		}
	}

    function oncut(e : ClipboardEvent) {
        e.preventDefault()
		e.clipboardData?.setData('text', getSelected())
        runActionOnSelected("delete")   
    } 

</script>

<svelte:window {oncut} {onpaste} {oncopy} />
