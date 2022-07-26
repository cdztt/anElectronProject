<template>
	<el-menu
	background-color='#EFF1F4'
	text-color='#464646'
	active-text-color='#565d08'
	@select='getMenuIndex'>
		<el-menu-item :class='{ active: !(menuIndex - 1), notActive: menuIndex - 1 }'
		index='1'
		@click='navToPad'>
			平板数据<i class="el-icon-arrow-right" v-show='!(menuIndex - 1)'></i>
		</el-menu-item>

		<el-menu-item :class='{ active: !(menuIndex - 2), notActive: menuIndex - 2 }'
		index='2'
		@click='navToScore'
		>
			成绩表格<i class="el-icon-arrow-right" v-show='!(menuIndex - 2)'></i>
		</el-menu-item>

		<el-menu-item :class='{ active: !(menuIndex - 3), notActive: menuIndex - 3 }'
		index='3'
		@click='navToRoster'
		>
			测试名单<i class="el-icon-arrow-right" v-show='!(menuIndex - 3)'></i>
		</el-menu-item>

		<el-menu-item :class='{ active: !(menuIndex - 4), notActive: menuIndex - 4 }'
		index='4'
		@click='navToScore'
		disabled>
			评分标准<i class="el-icon-arrow-right" v-show='!(menuIndex - 4)'></i>
		</el-menu-item>

		<el-menu-item :class='{ active: !(menuIndex - 5), notActive: menuIndex - 5 }'
		index='5'
		@click='navToTester'
		>
			测试任务<i class="el-icon-arrow-right" v-show='!(menuIndex - 5)'></i>
		</el-menu-item>

		<el-menu-item :class='{ active: !(menuIndex - 6), notActive: menuIndex - 6 }'
		index='6'
		@click='navToJjzk'
		>
			靖江中考<i class="el-icon-arrow-right" v-show='!(menuIndex - 6)'></i>
		</el-menu-item>
	</el-menu>
</template>

<script>
	export default {
		data() {
			return {
				menuIndex: 0
			}
		},
		methods: {
			navToPad() {
				if (this.$route.path !== '/localserver') {
					this.$router.push('/localserver')
				}
			},
			navToScore() {
				if (this.$route.path !== '/scoretable') {
					this.$router.push('/scoretable')
				}
			},
			navToRoster() {
				if (this.$route.path !== '/roster') {
					this.$router.push('/roster')
				}
			},
			navToTester() {
				if (this.$route.path !== '/tester') {
					this.$router.push('/tester')
				}
			},
			navToJjzk() {
				if (this.$route.path !== '/jjzk') {
					this.$router.push('/jjzk')
				}
			},
			getMenuIndex(index) {
				this.menuIndex = index
			}
		}
	}
</script>

<style>
	.notActive {
		text-decoration: underline;
	}
	.active {
		font-size: larger;
	}
</style>
