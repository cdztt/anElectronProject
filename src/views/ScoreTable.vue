<template>
	<div>
		<!-- <import-score-files></import-score-files> -->
		<import-score></import-score>
		<total-table></total-table>
	</div>
</template>

<script>
	// import ImportScoreFiles from '../components/ImportScoreFiles.vue'
	import ImportScore from '../components/ImportScore.vue'
	import TotalTable from '../components/TotalTable.vue'
	
	export default {
		components: {
			// ImportScoreFiles,
			ImportScore,
			TotalTable
		}
	}
</script>

<style>
</style>
