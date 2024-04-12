<script lang="ts">
	import { And } from '$lib/and.svelte'
	import TwoInOneOut from './TwoInOneOut.svelte'
	let { and, disabled = false }: { and: And, disabled? : boolean } = $props()
</script>

<TwoInOneOut obj={and} path={"M 0 0 L 25 0 c 20 0 20 30 0 30 L 0 30 L 0 0"} {disabled} />
