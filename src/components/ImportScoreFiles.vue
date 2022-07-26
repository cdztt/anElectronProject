<template>
	<div>
		<el-form label-width='130px'>
			<el-form-item>
				<template #label>
					<el-tooltip>
						<template #content>
							对于同一项目里，一个身份证号的多个重复成绩，选择一种覆盖方式
						</template>
						<span><i class='el-icon-warning-outline'></i>选择覆盖方式：</span>
					</el-tooltip>
				</template>
				<el-row>
					<el-col :span='8'>
						<el-radio label='time'
						v-model='rule'>最新时间</el-radio>
					</el-col>
					<el-col :span='8'>
						<el-radio label='score'
						v-model='rule'>最好成绩</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<!--  -->
			<!--  -->
			<el-form-item class='input-files'>
				<template #label>
					<el-tooltip>
						<template #content>
							如修改excel后提交报错，先执行一次：选择文件，不选直接关闭弹窗。后再正常选择
						</template>
						<div class='label'>
							<span><i class='el-icon-warning-outline'></i>选择<span class='emphasis'>.xlsx</span>文件，</span>
							<span class='newline'>可同时选择<span class='emphasis'>多个</span>：</span>
						</div>
					</el-tooltip>
				</template>
				<!--  -->
				<el-row>
					<el-col :span='8'>
						<!-- input被隐藏 -->
						<input type="file"
						multiple
						style='display: none;'
						ref='inputFiles'
						accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						@change='getFiles'>
						
						<!-- 通过这个button间接触发input的click事件 -->
						<el-button type='success'
						@click='selectFiles'>
							选择文件
						</el-button>
					</el-col>
					<!--  -->
					<el-col :span='8'>
						<span>已选择 {{filesCount}} 个文件</span>
					</el-col>
					<!--  -->
					<el-col :span='8'>
						<el-button type='primary'
						plain
						:loading='clicked'
						@click='mergeData'>
							提交
						</el-button>
						
						<!-- a链接拿来下载生成的文件，隐藏不显示 -->
						<a style='display: none;'
						ref='exportFile'
						></a>
					</el-col>
				</el-row>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
	import { mapState, mapMutations, mapActions } from 'vuex'
	
	export default {
		data() {
			return {
				rule: 'time',//默认时间优先
				files: '',
			}
		},
		computed: {
			...mapState([
				'msgOpts',
				'clicked'
			]),
			filesCount() {
				return this.files.length
			},
		},
		methods: {
			...mapMutations([
				'setClickedTrue',
			]),
			...mapActions([
				'endClick',
				'raw2Cooked'
			]),
			getFiles(event) {
				this.files = event.target.files
			},
			selectFiles() {
				this.$refs.inputFiles.click()//调用<input>的原生click方法
			},
			async mergeData() {
				if (this.clicked) return//1
				this.setClickedTrue()
				
				if (!this.files[0]) {//虽然使用files[0]，但files并不是数组
					this.$message({
						message: '未选择任何文件',
						type: 'error',
						...this.msgOpts
					})
					return this.endClick()//2
				}
				// this.raw2Cooked({
				// 	files: this.files,
				// 	rule: this.rule,
				// })
				
				const result = await this.raw2Cooked({
					files: this.files,
					rule: this.rule,
				})
				
				if (result.errMsg) {
					this.$message({
						message: `${result.errMsg}`,
						type: 'error',
						...this.msgOpts
					})
					return this.endClick()//3
				}
				
				this.$refs.exportFile.href = result.url//a链接的url
				this.$refs.exportFile.download = `测试成绩汇总${new Date().toLocaleString()}.xlsx`//a链接的文件名
				this.$refs.exportFile.click()
				this.endClick()//4
			},
		}
	}
</script>

<style>
	.label {
		position: relative;
		top: -10px;
	}
	.newline {
		position: relative;
		top: -20px;
		display: block;/*显示为块级元素，有换行*/
	}
	.emphasis {
		color: #409EFF;
	}
	.input-files {
		position: relative;
		top: 40px;
	}
</style>
