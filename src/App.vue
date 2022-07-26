<template>
  <div id="app">
	<!-- 标题栏 -->
	<div class='titleBar'>
		<!-- 图标和文字 -->
		<div class='title'>
			<div class='logo'>
				<img src="../public/icon.png">
			</div>
			<div class='txt'>
				汇洋体测数据管理{{'v' + appVersion}}
			</div>
		</div>
		<!-- 窗口控件 -->
		<div class='windowTool'>
			<div @click="minimize">
				<i class='iconfont iconminisize'></i>
			</div>
			<div
			@click="restore"
			v-if='isMaxSize'>
				<i class='iconfont iconrestore'></i>
			</div>
			<div
			@click="maximize"
			v-else>
				<i class='iconfont iconmaxsize'></i>
			</div>
			<div class='close'
			@click="close">
				<i class='iconfont iconclose'></i>
			</div>
		</div>
	</div>
	<!-- 主体 -->
	<div class='mainBody'>
		<div class='menu'>
			<nav-menu></nav-menu>
		</div>
		<div class='divider'></div>
		<div class='content'>
			<router-view></router-view>
		</div>
	</div>
  </div>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import NavMenu from './components/NavMenu.vue'
	const ipcRenderer = window._ipcRenderer
	
	export default {
		components: {
			NavMenu
		},
		data() {
			return {
				isMaxSize: false,
			}
		},
		computed: {
			...mapState({
				appVersion: state => state.appVersion,
			})
		},
		mounted() {
			// 在mounted里注册一个监听器，全生命周期都存在
			ipcRenderer.on('ismaxsize_m2r', (ev, arg) => {
				this.isMaxSize = arg
			})
			ipcRenderer.on('appinfo_m2r', (ev, ...args) => {
				this.SET_APP_VERSION(args[0])
				this.SET_USER_DATA_PATH(args[1])
			})
		},
		methods: {
			...mapMutations([
				'SET_APP_VERSION',
				'SET_USER_DATA_PATH'
			]),
			minimize() {
				ipcRenderer.send('windowtool_r2m', 'minimize')
			},
			restore() {
				ipcRenderer.send('windowtool_r2m', 'restore')
			},
			maximize() {
				ipcRenderer.send('windowtool_r2m', 'maximize')
			},
			close() {
				ipcRenderer.send('windowtool_r2m', 'close')
			}
		}
	}
</script>

<style>
	body, html {
		margin: 0px;
		padding: 0px;
		overflow: hidden;
		height: 100%;
	}
	
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /* color: #2c3e50; */
  margin: 0px;
  padding: 0px;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid #bfc7cc;
  display: flex;
  flex-direction: column;
}
</style>
<style lang='scss'>
	@import url(https://at.alicdn.com/t/font_1378132_s4e44adve5.css);
	.titleBar {
		height: 50px;
		line-height: 50px;
		background: #ffffff;
		display: flex;
		border-bottom: 2px solid #e8eaee;
		.title {
			flex: 1;
			display: flex;
			-webkit-app-region: drag;
			.logo {
				padding-left: 12px;
				padding-right: 12px;
				img {
					width: 32px;
					height: 32px;
					margin-top: 8px;
				}
			}
			.txt {
				text-align: left;
				flex: 1;
			}
		}
		.windowTool {
			div {
				color: #bfc7cc;
				height: 100%;
				width: 50px;
				display: inline-block;
				cursor: pointer;
				i {
					font-size: 12px;
				}
				&:hover {
					color: #000000;
				}
			}
			.close:hover {
				color: #d01212;
			}
		}
	}
	.mainBody {
		flex: 1;
		display: flex;
		flex-direction: row;
		.menu {
			width: 120px;
			background-color: #e8eaee;
			padding-left: 1px;
		}
		.divider {
			width: 3px;
			background-color: #e8eaee;
		}
		.content {
			flex: 1;
		}
		
	}
</style>
