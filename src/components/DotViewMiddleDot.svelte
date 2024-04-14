<script lang="ts">
	let { live = false }: { live?: boolean } = $props()
</script>

<circle class="show" cx={0} cy={0} r="5" fill={live ? 'green' : 'grey'} />

<style>
	circle.show {
		pointer-events: none;
	}
</style>
