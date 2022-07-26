<template>
	<el-card
	shadow='never'>
		<template #header>
			<span>本地服务器</span>
		</template>
		<!--  -->
		<el-form class='serverForm'
		label-width='auto'>
			<!-- 状态 -->
			<el-form-item label='状态'>
				<el-tag
				:type='isServerOn ? "" : "danger"'>
					{{serverState}}
				</el-tag>
			</el-form-item>
			<!-- IP地址 -->
			<el-form-item label='IP地址'>
				<el-tag>
					{{localIP}}
				</el-tag>
			</el-form-item>
			<!-- 按钮 -->
			<el-form-item>
				<el-button
				type='success'
				@click='openServer'>
					开启
				</el-button>
				
				<el-button
				type='info'
				@click='closeServer'>
					关闭
				</el-button>
			</el-form-item>
		</el-form>
		
	</el-card>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	const server = window._server
	const formidable = window._formidable
	const path = window._path
	const fs = window._fs
	
	const localIP = window._localIP
	
	export default {
		data() {
			return {
				localIP,
				// files: null,
			}
		},
		computed: {
			...mapState({
				userDataPath: state => state.userDataPath,
				port: state => state.localServer.port,
				isServerOn: state => state.localServer.isServerOn
			}),
			serverState() {
				if (this.isServerOn) {
					// return `端口号：${this.port}`
					return `已开启`
				}
				else {
					return `已关闭`
				}
			}
		},
		methods: {
			...mapMutations([
				// 'SET_PORT',
				'SET_IS_SERVER_ON'
			]),
			openServer() {
				if (!server.listening) {
					// server.listen(0, this.localIP)//第一个参数0为自动分配可用端口，第二个参数指定IPV4地址
					server.listen(this.port, this.localIP)//第一个参数0为自动分配可用端口，第二个参数指定IPV4地址
					if (server.listenerCount('listening')) {//移除旧监听器
						server.removeAllListeners('listening')
					}
					server.on('listening', () => {
						// this.SET_PORT(server.address().port)
						this.SET_IS_SERVER_ON(true)
						// console.log('is listening')
					})
					//注册request监听器，确保只注册一次
					if (!server.listenerCount('request')) {
						server.on('request', (req, res) => {
							if (req.url === '/upload') {
								const form = formidable({
									multiples: true,
								})
								form.parse(req, (err, fields, files) => {
									if (err) {
										res.writeHead(200, {
											'Content-Type': 'application/json'
										})
										res.end(JSON.stringify({ status: 'ng', err }))
									}
									else {
										const processArr = Object.entries(files).map(el => {
											const [key, val] = el
											const targetDir = path.join(this.userDataPath, '原始数据')
											if (!fs.existsSync(targetDir)) {
												fs.mkdirSync(targetDir)
											}
											const newPath = path.join(targetDir, `${key}`)
											return new Promise((resolve, reject) => {
												fs.rename(val.path, newPath, err => {
													if (err) {
														reject(err)
													}
													resolve()
												})
											})
										})
										//异步批量处理
										Promise.all(processArr)
											.then(() => {
												res.writeHead(200, {
													'Content-Type': 'application/json',
												})
												res.end(JSON.stringify({ status: 'ok' }))
											})
											.catch(err => {
												res.writeHead(200, {
													'Content-Type': 'application/json',
												})
												res.end(JSON.stringify({ status: 'ng', err }))
											})
									}
								})
							}
							else {//没有使用/upload时，给一个响应
								res.writeHead(200, {
									'Content-Type': 'application/json'
								})
								res.end(JSON.stringify({ status: 'hi' }))
							}
						})
					}
				}
			},
			handleFiles() {
				const processArr = Object.entries(this.files).map(el => {
					const [key, val] = el
					const targetDir = path.join(this.userDataPath, '原始数据')
					if (!fs.existsSync(targetDir)) {
						fs.mkdirSync(targetDir)
					}
					const newPath = path.join(targetDir, `${key}`)
					return new Promise((resolve, reject) => {
						fs.rename(val.path, newPath, err => {
							if (err) {
								reject(err)
							}
							resolve()
						})
					})
				})
				//异步批量处理
				Promise.all(processArr)
					.then(() => {
						console.log('complete')
						// res.writeHead(200, {
						// 	'Content-Type': 'application/json',
						// })
						// res.end(JSON.stringify({ status: 'ok' }))
					})
					.catch(err => {
						console.log(err)
						// res.writeHead(200, {
						// 	'Content-Type': 'application/json',
						// })
						// res.end(JSON.stringify({ status: 'ng', err }))
					})
			},
			closeServer() {
				if (server.listening) {
					server.close()
					if (server.listenerCount('close')) {//移除旧监听器
						server.removeAllListeners('close')
					}
					server.on('close', () => {
						this.SET_IS_SERVER_ON(false)
						// console.log('has closed')
					})
				}
			},
		}
	}
</script>

<style>
	.serverForm {
		width: 210px;
		display: table;
		margin: 0 auto;
		text-align: left;
	}
</style>
