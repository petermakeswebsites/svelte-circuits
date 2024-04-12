<script lang="ts">
	import type { Source } from "$lib/source.svelte"
	import DotView from "./DotView.svelte"
	import DraggerBox from "./DraggerBox.svelte"
	import Group from "./Group.svelte"
    let {source, disabled} : {source: Source, disabled? : boolean} = $props()
</script>
<Group x={source.position.x} y={source.position.y}>
    <DraggerBox
        x={-15}
        y={-15}
        width={30}
        height={30}
        onNonDraggingClick={() => source.toggle()}
        dragPosition={source.position}
        selectable={source.selectable}
    />
    <DotView dot={source.dot} {disabled} />
</Group>