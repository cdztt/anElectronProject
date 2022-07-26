const fs = require('fs')
import xlsx from 'xlsx'

export default class {
	constructor(paths, fieldsNum, targetPath) {
		this.paths = paths
        this.fieldsNum = fieldsNum
		this.targetPath = targetPath
		this.personID = '个人识别码'
	}
	/*
	辅助函数，读取一个文件
	*/
	aFileToJSON(path) {
		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, resData) => {
				if (err) reject(err)
				//sheets: 0只读取第一个sheet
				const wb = xlsx.read(resData, { type: 'buffer', sheets: 0 })
				const sheet = wb.Sheets[wb.SheetNames[0]]
				const opts = {
					// blankrows: true,//为true时范围内的空行作为{}添加在JSON数组里，默认为false
					defval: '',//非空行内的空单元格给空字符，以保留字段
				}
				let data = xlsx.utils.sheet_to_json(sheet, opts)
				if (data[0]) {
					const header = this.fieldsNum.map(el => Object.keys(data[0])[el])
					data = data.map(obj => {
						const tmpObj = {}
						tmpObj[this.personID] = obj[header[0]]
						tmpObj[obj[header[1]]] = obj[header[2]]
						return tmpObj
					})
				}
				resolve(data)
			})
		})
	}
	/*
	辅助函数，读取多个文件
	*/
	async filesToJSON(paths) {
		const handleArr = paths.map(path => this.aFileToJSON(path))
		const result = await Promise.all(handleArr).then(res => res).catch(err => err)
		if (Array.isArray(result)) {
			const tmpArr = []
			result.forEach(el => {
				tmpArr.push(...el)
			})
			const idPool = []
			const data = []
			tmpArr.forEach(el => {
				const idx = idPool.indexOf(el[this.personID])
				if (idx === -1) {
					data.push(el)
					idPool.push(String(el[this.personID]))
				}
				else {
					Object.assign(data[idx], el)
				}
			})
			return data
		}
		throw result
	}
	/*
	api
	*/
	async getWorkbook() {
		const wb = xlsx.utils.book_new()
		const data = await this.filesToJSON(this.paths).then(res => res).catch(err => err)
		if (Array.isArray(data)) {
			const sheet = xlsx.utils.json_to_sheet(data)
			xlsx.utils.book_append_sheet(wb, sheet)
			xlsx.writeFile(wb, this.targetPath)
		}
		else {
			throw data
		}
	}
}
