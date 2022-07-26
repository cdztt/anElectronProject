<template>
	<div>
		<div>
			使用说明：<br>
			1 把《模板.xlsx》放到单独的一个文件夹，第一个sheet即为总名单，格式不要变<br><br>
			2 第二个sheet就是考试日程，“时间编码”151表示15号上午，152表示15号下午，即第3位的1表示上午2表示下午<br><br>
			3 “学校代码”填写考试学校的代码，“人数”即为该时间段该校的考试人数<br><br>
			4 后续如果名单有变化，就把人数一列对应的值修改了，总名单也要做同步的修改<br><br>
			5 点击“分组”按钮，选择《模板.xlsx》，点击确定<br><br>
			6 excel名字1511282321，前3位表示时间段，中间6位是学校代码，最后1位是该时间段该校的大单元的序号<br><br>
		</div>
		<br>
		<el-button
		type='success'
		@click='divideGroups'>
			分组
		</el-button>
		<el-button
		type='success'
		@click='combineGroups'>
			合并
		</el-button>
	</div>	
</template>

<script>
	const ipcRenderer = window._ipcRenderer
	
	export default {
		methods: {
			divideGroups() {
				ipcRenderer.send('dialog_r2m', 'divide')
			},
			combineGroups() {
				ipcRenderer.send('dialog_r2m', 'combine')
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
