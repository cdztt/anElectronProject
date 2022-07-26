<template>
	<el-card
	shadow='never'>
		<template #header>
			<span>使用说明</span>
		</template>
		<el-form class='txt'
		label-width='auto'>
			<el-form-item label='1'>
				<span>让平板和电脑连接同一个WiFi</span>
			</el-form-item>
			<el-form-item label='2'>
				<span>点击左边[开启]按钮获得端口号</span>
			</el-form-item>
			<el-form-item label='3'>
				<span>使用平板上的app上传成绩文件</span>
			</el-form-item>
			<el-form-item label='4'>
				<span>到"{{userDataPath}}\原始数据"文件夹下查看上传的文件</span>
			</el-form-item>
		</el-form>
	</el-card>
</template>

<script>
	import { mapState } from 'vuex'
	
	export default {
		computed: {
			...mapState({
				userDataPath: state => state.userDataPath
			})
		},
	}
</script>

<style>
	.txt {
		width: 280px;
		display: table;
		margin: 0 auto;
		text-align: left;
	}
</style>
