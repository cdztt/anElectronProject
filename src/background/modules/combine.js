const fs = require('fs')
const path = require('path')
import xlsx from 'xlsx'

export default class {
	constructor(sourcePaths) {
		this.sourcePaths = sourcePaths
	}
	// 读一个excel
	aFileToJSON(sourcePath) {
		return new Promise((resolve, reject) => {
			fs.readFile(sourcePath, (err, resData) => {
				if (err) reject(err)
				//sheets: 0只读取第一个sheet
				const wb = xlsx.read(resData, { type: 'buffer', sheets: 0 })
				const sheet = wb.Sheets[wb.SheetNames[0]]
				const opts = {
					// blankrows: true,//为true时范围内的空行作为{}添加在JSON数组里，默认为false
					defval: '',//非空行内的空单元格给空字符，以保留字段
				}
				const roster = xlsx.utils.sheet_to_json(sheet, opts)
				resolve(roster)
			})
		})
	}
	async filesToJSON(paths) {
		const handleArr = paths.map(path => this.aFileToJSON(path))
		const result = await Promise.all(handleArr).then(res => res).catch(err => err)
		if (Array.isArray(result)) {
			const data = []
			result.forEach(el => {
				data.push(...el)
			})
			return data
		}
		throw result
	}
	
	// 导出到excel
	async getWorkbook() {		
		const wb = xlsx.utils.book_new()
		const data = await this.filesToJSON(this.sourcePaths).then(res => res).catch(err => err)
		const sheet = xlsx.utils.json_to_sheet(data)
		xlsx.utils.book_append_sheet(wb, sheet)
		const targetPath = path.resolve(path.dirname(this.sourcePaths[0]), `靖江总表.xlsx`)
		xlsx.writeFile(wb, targetPath)
	}
}