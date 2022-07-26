<template>
	<div>
		<el-table
		:data='docs'
		style="width: 100%"
		size='medium'
		tooltip-effect='light'
		>
			<el-table-column
			prop='personID'
			label='编号'
			width='100'
			>				
			</el-table-column>
			
			<el-table-column
			prop='personSchool'
			label='学校'
			width='100'
			show-overflow-tooltip
			>				
			</el-table-column>
			
			<el-table-column
			prop='personName'
			label='姓名'
			width='100'>				
			</el-table-column>
			
			<el-table-column
			prop='gender'
			label='性别'
			width='50'>				
			</el-table-column>
			
			<el-table-column
			prop='score'
			label='成绩'
			width='50'>				
			</el-table-column>
			
		</el-table>
	</div>
</template>

<script>	
	export default {
		data() {
			return {
				test: 'hello',
				docs: [
					{
						personID: 111,
						personSchool: '第一中学',
						personName: '张三',
						gender: '男'
					},
					{
						personID: 122,
						personSchool: '扬州市施桥镇实验中学',
						personName: '李四',
						gender: '女'
					},
					{
						personID: 111,
						personSchool: '第一中学',
						personName: '张三',
						gender: '男'
					},
					{
						personID: 122,
						personSchool: '扬州市施桥镇实验中学',
						personName: '李四',
						gender: '女'
					},
					{
						personID: 111,
						personSchool: '第一中学',
						personName: '张三',
						gender: '男'
					},
					{
						personID: 122,
						personSchool: '扬州市施桥镇实验中学',
						personName: '李四',
						gender: '女'
					},
				],
			}
		},
	}
</script>

<style>
</style>
