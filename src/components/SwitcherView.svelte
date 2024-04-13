<script lang="ts">
	import type { Switcher } from "$lib/switcher.svelte"
	import DotView from "./DotView.svelte"
	import DraggerBox from "./DraggerBox.svelte"
	import Group from "./Group.svelte"
	import Path from "./Path.svelte"
	import StubbyLine from "./StubbyLine.svelte"

    let {switcher, disabled = false} : {switcher: Switcher, disabled? : boolean} = $props()
</script>

<Group x={switcher.position.x} y={switcher.position.y}>
    <DraggerBox
        selectable={switcher.selectable}
        onNonDraggingClick={() => {
            switcher.toggle()
        }}
        dragPosition={switcher.position}
        width={70}
        height={40}
    />
    <g transform="translate(2, 8)">
        <g class="spinner" class:open={switcher.open}>
            <Path
                live={!switcher.open}
                path="M 0 0 l 15 0"
            />
        </g>
    </g>
    <StubbyLine live={switcher.from.connector.isLive} x={-5} y={10} />
    <StubbyLine live={switcher.to.connector.isLive} x={15} y={10} />
    <DotView dot={switcher.from} {disabled} />
    <DotView dot={switcher.to} {disabled} />
</Group>

<style>
    g.spinner {
        transform: rotate(0deg);
        transition: all 0.2s
    }

    g.spinner.open {
        transform: rotate(-45deg);
    }
</style>
