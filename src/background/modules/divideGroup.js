const fs = require('fs')
const path = require('path')
import xlsx from 'xlsx'

export default class {
	constructor(sourcePath) {
		this.sourcePath = sourcePath
	}
	// 读一个excel
	readAnExcel(sourcePath) {
		return new Promise((resolve, reject) => {
			fs.readFile(sourcePath, (err, resData) => {
				if (err) reject(err)
				//sheets: 0只读取第一个sheet
				const wb = xlsx.read(resData, { type: 'buffer'/* , sheets: 0 */ })
				const sheet1 = wb.Sheets[wb.SheetNames[0]]
				const sheet2 = wb.Sheets[wb.SheetNames[1]]
				const opts = {
					// blankrows: true,//为true时范围内的空行作为{}添加在JSON数组里，默认为false
					defval: '',//非空行内的空单元格给空字符，以保留字段
				}
				const roster = xlsx.utils.sheet_to_json(sheet1, opts)
				const schedule = xlsx.utils.sheet_to_json(sheet2, opts)
				resolve({
					roster,
					schedule
				})
			})
		})
	}
	// 主逻辑
	async handleData() {
		let { roster, schedule } = await this.readAnExcel(this.sourcePath).then(res => res).catch(err => err)
		if (Array.isArray(roster)) {
			const schoolArr = []
			const schoolCodeArr = []//后面会根据学校代码重整名单rosterOnSchool
			roster.forEach(item => {
				if (!schoolArr.includes(item['学校名称'])) {
					schoolArr.push(item['学校名称'])
					schoolCodeArr.push(item['学校代码'])
				}				
			})
			// console.log(schoolCodeArr)
			//为日程元素增加单元数
			schedule.forEach(item => {
				if (item['人数'] <= 120) {
					item['单元数'] = 1
				}
				else {
					if (item['人数'] % 120 > 80) {
						item['单元数'] = Math.floor(item['人数'] / 120) + 1
					}
					else {
						item['单元数'] = Math.floor(item['人数'] / 120)
					}
				}				
			})
			// console.log(schedule)
			//为日程元素增加单元属性，单元值是数组，数组元素是对象，对象将包含‘单元编号’和‘单元名单’2个属性
			schedule.forEach(item => {
				const units = []
				for (let i = 1; i <= item['单元数']; i ++) {
					units.push({ '单元编号': String(item['时间编码']) + item['学校代码'] + i })
				}
				item['单元'] = units
			})
			// console.log(schedule)
			// console.log(schedule[0]['单元'])		
			//把总名单增加比较码
			roster.forEach(person => {
				person['比较码'] = Number((person['性别'] === '女' ? '1' : '2') + person['考生类别编码'])
			})
			// console.log(roster)
			//基于学校代码的名单，键为学校代码，值为名单数组
			const rosterOnSchool = {}
			schoolCodeArr.forEach(item => {
				const personOfSchool = []
				roster.forEach(person => {
					if (person['学校代码'] === item) {
						personOfSchool.push(person)
					}
				})
				rosterOnSchool[item] = personOfSchool
			})
			// console.log(rosterOnSchool)
			
			//因为有重复学校且只重复一次，对于第二次出现的学校，索引值为第一次的总人数
			const repetitiveSchool = {}
			let startIndex
			
			//生成单元名单的逻辑
			schedule/* .slice(0, 1) */.forEach(item => {
				if (Object.keys(repetitiveSchool).includes(String(item['学校代码']))) {
					startIndex = repetitiveSchool[item['学校代码']]
				}
				else {
					repetitiveSchool[item['学校代码']] = item['人数']
					startIndex = 0
				}
				// console.log(startIndex)
				
				//把该校的名称单独放入一个地方
				const personPool = [].concat(rosterOnSchool[item['学校代码']])
				// console.log(personPool.length)				
				for (let i = 0; i < item['单元数']; i ++) {
					const personOfUnitArr = [{ '比较码': 31 }]//设一个初始元素，其比较码最大，最后要删除该元素
					if (i !== item['单元数'] - 1) {//这是截取120个人的单元
						const currentPool = personPool.slice(startIndex).slice(120 * i, 120 * (i + 1))
						this.randomSort(120, currentPool, personOfUnitArr)						
					}
					else {//这是最后一个单元，人数小于200
						const currentPool = personPool.slice(startIndex).slice(120 * i, item['人数'])
						const len = currentPool.length
						this.randomSort(len, currentPool, personOfUnitArr)
					}
					personOfUnitArr.pop()//把初始元素删除
					item['单元'][i]['单元名单'] = personOfUnitArr
				}
				// console.log(item)
			})
			// console.log(schedule)
			let totalUnitCount = 0
			let lastDate = '151'
			schedule.forEach(item => {
				
				item['单元'].forEach(unit => {
					const unitRoster = unit['单元名单']
					unitRoster.forEach(person => {
						Object.defineProperty(person, '比较码', { enumerable: false })
					})

					const unitDate = unit['单元编号'].substring(0, 3)
					const tmp = Number(unitDate.substring(0, 2))
					const unitDateNum = (tmp < 18 ? tmp - 14 : tmp - 15) + unitDate.charAt(2)
					if (unitDate !== lastDate) {
						totalUnitCount = 0
						lastDate = unitDate
					}
					
					const dataArr = []
					const remainder = unitRoster.length % 8 || 8
					const count = Math.ceil(unitRoster.length / 8)
					for (let i = 0; i < count; i ++) {
						for (let j = 0; j < (i < count - 1 ? 8 : remainder); j ++) {
							unitRoster[i * 8 + j]['组号'] = unitDateNum + ((i + 1 + totalUnitCount) < 10 ? '0' + (i + 1 + totalUnitCount) : String(i + 1 + totalUnitCount))
							unitRoster[i * 8 + j]['组内号'] = j + 1
						}
						dataArr.push(unitRoster.slice(8 * i, 8 *(i + 1)))
					}
					totalUnitCount += count
					this.getWorkbookWithDetail(unitRoster, dataArr, unit['单元编号'], count, totalUnitCount)
					// this.getWorkbookOfSheets(unit['单元名单'], dataArr, unit['单元编号'])
				})
			})
			console.log(totalUnitCount)
			return 1//这是个async函数，调用端需要做then处理，送一个值给它的res，否则res就是上面await的result
		}
		throw result
	}
	// 辅助函数，随机排序
	randomSort(len, currentPool, personOfUnitArr) {
		for (let j = 0; j < len; j ++) {
			const randomIndex = Math.floor(Math.random() * (len - j))
			const randomPerson = currentPool[randomIndex]
			for (let k = 0; k < personOfUnitArr.length; k ++) {
				if (randomPerson['比较码'] <= personOfUnitArr[k]['比较码']) {
					personOfUnitArr.splice(k, 0, randomPerson)//在索引k元素的前面插入随机的人
					currentPool.splice(randomIndex, 1)//把这个随机的人从池子里删除
					break//退出整个for循环
				}
			}
		}
	}
	// 导出到excel，带细节
	getWorkbookWithDetail(total, dataArr, name, count, totalUnitCount) {
		const wb = xlsx.utils.book_new()
		const countOfPerson = total.length
		const countOfGroup = dataArr.length
		const sheet = xlsx.utils.json_to_sheet(total)
		xlsx.utils.book_append_sheet(wb, sheet)
		const wbName
			= `${name.substring(0, 2)}号${name.charAt(2) === '1' ? '上午' : '下午'}${name.substring(3, 9)}学校第${name.charAt(9)}单元(${totalUnitCount - count + 1}~${totalUnitCount})共${countOfPerson}人${countOfGroup}个小组.xlsx`
		const targetPath = path.resolve(path.dirname(this.sourcePath), wbName)
		xlsx.writeFile(wb, targetPath)
	}
	// 导出到excel
	getWorkbook(data, name) {
		const wb = xlsx.utils.book_new()
		const sheet = xlsx.utils.json_to_sheet(data)
		xlsx.utils.book_append_sheet(wb, sheet)
		const targetPath = path.resolve(path.dirname(this.sourcePath), `${name}.xlsx`)
		xlsx.writeFile(wb, targetPath)
	}
	// 导出到excel，多sheet
	getWorkbookOfSheets(total, dataArr, name) {
		const wb = xlsx.utils.book_new()
		const countOfPerson = total.length
		const countOfGroup = dataArr.length
		
		const sheet = xlsx.utils.json_to_sheet(total)
		xlsx.utils.book_append_sheet(wb, sheet, `总览`)		
		
		for (let i = 0; i < countOfGroup; i ++) {
			const sheet = xlsx.utils.json_to_sheet(dataArr[i])
			xlsx.utils.book_append_sheet(wb, sheet, `第${i + 1}组`)
		}
		const wbName
			= `${name.substring(0, 2)}号${name.charAt(2) === '1' ? '上午' : '下午'}${name.substring(3, 9)}学校第${name.charAt(9)}单元共${countOfPerson}人${countOfGroup}个小组.xlsx`
		const targetPath = path.resolve(path.dirname(this.sourcePath), wbName)
		xlsx.writeFile(wb, targetPath)
	}
}