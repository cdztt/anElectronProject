<template>
	<el-card>
		<template #header>
			<span>合并数据</span>
		</template>
		<el-form class='txt'
		label-width='auto'>
			<el-form-item label='1'>
				<span>在“原始数据”文件夹下选择文件</span>
			</el-form-item>
			<el-form-item label='2'>
				<span>合并成功后在“合并数据”文件夹下查看</span>
			</el-form-item>
		</el-form>
		<el-button
		type='success'
		@click='mergeData'>
			合并数据
		</el-button>
	</el-card>
</template>

<script>
	const ipcRenderer = window._ipcRenderer
	import { mapState } from 'vuex'
	
	export default {
		computed: {
			...mapState({
				msgOpts: state => state.msgOpts
			})
		},
		methods: {
			mergeData() {
				ipcRenderer.send('dialog_r2m', 'merge')
			}
		},
		mounted() {
			ipcRenderer.on('dialog_m2r', (ev, ...args) => {
				if (args[0] === 'success') {
					this.$message({ message: '成功！',
						type: 'success', ...this.msgOpts })
				}
				else {
					this.$message({ message: `失败！`,
						type: 'error', ...this.msgOpts })
				}
			})
		}
	}
</script>

<style>
</style>
