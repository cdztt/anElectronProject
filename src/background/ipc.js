import { app, ipcMain, dialog } from 'electron'
const path = require('path')
const fs = require('fs')
import MergeData from './modules/mergeData.js'
import DivideGroup from './modules/divideGroup.js'
import Combine from './modules/combine.js'

const USER_DATA_PATH = app.getPath('userData')

function ipc(win) {
	//接收渲染进程对窗口工具的使用
	ipcMain.on('windowtool_r2m', (event, arg) => {
		  if (arg === 'maximize') {
			  win.maximize()
		  }
		  else if (arg === 'minimize') {
			  win.minimize()
		  }
		  else if (arg === 'restore') {
			  win.restore()
		  }
		  else if (arg === 'close') {
			  win.destroy()
		  }
	})
	//监听窗口是否最大化，给渲染进程发消息，切换最大化和还原按钮
	win.on('maximize', () => {
		  win.webContents.send('ismaxsize_m2r', true)
	})
	win.on('unmaximize', () => {
		  win.webContents.send('ismaxsize_m2r', false)
	})
	//把app的相关信息发给渲染进程
	win.webContents.on('dom-ready', () => {
		  win.webContents.send('appinfo_m2r', app.getVersion(), app.getPath('userData'))
	})
	// console.log(app.getPath('userData'))
	//与渲染进程通信打开对话框
	ipcMain.on('dialog_r2m', (ev, arg) => {
		if (arg === 'merge') {
			dialog.showOpenDialog(win, {
				properties: [
					'openFile',
					'multiSelections',
				],
				title: '选择文件',
				buttonLabel: '确定',
				defaultPath: path.join(USER_DATA_PATH, '原始数据'),
				filters: [
					{ name: '平板数据', extensions: ['xlsx', 'csv'] }
				]
			})
			.then(res => {
				if (!res.canceled) {
					const paths = res.filePaths
					const fieldsNum = [2, 0, 6]
					const targetDir = path.join(USER_DATA_PATH, '合并数据')
					if (!fs.existsSync(targetDir)) {
						fs.mkdirSync(targetDir)
					}
					const nowTime = new Date(Date.now() + 8 * 3600 * 1000).toISOString().replace(/:/g, '-')
					const targetPath = path.join(targetDir, `合并数据_${nowTime}.xlsx`)
					const handler = new MergeData(paths, fieldsNum, targetPath)
					handler.getWorkbook()
					.then(res => {
						// console.log('ok')
						ev.reply('dialog_m2r', 'success')
					})
					.catch(err => {
						// console.log(err)
						ev.reply('dialog_m2r', 'fail', err)
					})
				}
			})
			.catch(err => {
				ev.reply('dialog_m2r', 'fail', err)
			})
		}
		else if (arg === 'divide') {
			dialog.showOpenDialog(win, {
				properties: [
					'openFile',
					// 'multiSelections',
				],
				title: '选择文件',
				buttonLabel: '确定',
				// defaultPath: path.join(USER_DATA_PATH, '原始数据'),
				filters: [
					{ name: '中考名单', extensions: ['xlsx'] }
				]
			})
			.then(res => {
				if (!res.canceled) {
					const sourcePath = res.filePaths[0]
					const handler = new DivideGroup(sourcePath)
					handler.handleData()
					.then(res => {
						// console.log(res)
						if (res === 1) {
							ev.reply('dialog_m2r', 'success')
						}
					})
					.catch(err => {
						console.log(err)
					})
				}
			})
			.catch(err => {
				// ev.reply('dialog_m2r', 'fail', err)
				console.log(err)
			})
		}
		else if (arg === 'combine') {
			dialog.showOpenDialog(win, {
				properties: [
					'openFile',
					'multiSelections',
				],
				title: '选择文件',
				buttonLabel: '确定',
				// defaultPath: path.join(USER_DATA_PATH, '原始数据'),
				filters: [
					{ name: '平板数据', extensions: ['xlsx', 'csv'] }
				]
			})
			.then(res => {
				if (!res.canceled) {
					const paths = res.filePaths
					// const fieldsNum = [2, 0, 6]
					// const targetDir = path.join(USER_DATA_PATH, '合并数据')
					// if (!fs.existsSync(targetDir)) {
					// 	fs.mkdirSync(targetDir)
					// }
					// const nowTime = new Date(Date.now() + 8 * 3600 * 1000).toISOString().replace(/:/g, '-')
					// const targetPath = path.join(targetDir, `合并数据_${nowTime}.xlsx`)
					const handler = new Combine(paths)
					handler.getWorkbook()
					.then(res => {
						console.log('ok')
					})
					.catch(err => {
						console.log(err)
						// ev.reply('dialog_m2r', 'fail', err)
					})
				}
			})
			.catch(err => {
				// ev.reply('dialog_m2r', 'fail', err)
				console.log(err)
			})
		}
	})
}

export {
	ipc
}
