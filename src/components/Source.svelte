<!-- <text>Ctrl</text> -->
<circle r="10" fill="green" />

<style>
	@keyframes pulse {
		0% {
			r: 0;
			opacity: 1;
		}
		100% {
			r: 20;
			opacity: 0;
		}
	}

	circle {
		animation: pulse 2s infinite;
	}
</style>
