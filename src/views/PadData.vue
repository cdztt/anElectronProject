<template>
	<div class='padData'>
		<LocalServer class='server'></LocalServer>
		<TutorialLocalServer class='tutorial'></TutorialLocalServer>
	</div>
</template>

<script>
	import LocalServer from '../components/LocalServer.vue'
	import TutorialLocalServer from '../components/TutorialLocalServer.vue'
	
	export default {
		components: {
			LocalServer,
			TutorialLocalServer,
		}
	}
</script>

<style lang='scss'>
	.padData {
		display: flex;
		flex-direction: row;
		.server {
			flex: 1;
		}
		.tutorial {
		}
	}
</style>
