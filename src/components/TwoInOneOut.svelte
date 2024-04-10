<script lang="ts">
	import { And } from '$lib/and.svelte'
	import { Or } from '$lib/or.svelte'
	import DraggerBox from './DraggerBox.svelte'
	import Group from './Group.svelte'
	import Path from './Path.svelte'
	import StubbyLine from './StubbyLine.svelte'
	import DotView from './DotView.svelte'
	import type { TwoInOneOut } from '$lib/primitives.svelte'
	let { obj, path }: { obj: TwoInOneOut, path : string } = $props()
	// $inspect(obj.input1.connector.cluster, "in1")
	// $inspect(obj.input2.connector.cluster, "in2")
	// $inspect(obj.output.connector.cluster, "output")
	$inspect(obj.output.connector.emitting, "emitting")
</script>

<Group x={obj.position.x} y={obj.position.y}>
	<!-- <Text x={0} y={-10} fontSize="13px">AND</Text> -->
	<DraggerBox selectable={obj.selectable} dragPosition={obj.position} x={-20} y={-15} width={80} height={50} />
	<Group x={-0} y={-5}>
		<Path live={obj.output.connector.emitting} {path} />
    </Group>
	<StubbyLine live={obj.input1.connector.isLive} x={0} y={0} backwards />
	<StubbyLine live={obj.input2.connector.isLive} x={0} y={20} backwards />
	<StubbyLine live={obj.output.connector.isLive} x={40} y={10} />
	<DotView dot={obj.input1} />
	<DotView dot={obj.input2} />
	<DotView dot={obj.output} />
</Group>
