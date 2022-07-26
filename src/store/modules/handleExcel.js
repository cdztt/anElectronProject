import xlsx from 'xlsx'

/************
把reader.readAsArrayBuffer(file)的数据转成json数据*/
function aExcelArrayBuffer2Json(arr) {
	const workbook = xlsx.read(arr, { type: 'array' })//读取excel
	const sheet = workbook.Sheets[workbook.SheetNames[0]]//读取第一个sheet
	const opts = {
		blankrows: true,
		defval: ''//这2个选项需配合使用，才能把未填单元格改为defval的值
	}
	const data = xlsx.utils.sheet_to_json(sheet, opts)//sheet转json数据
	return data
}

/****************
处理单个文件*/
function aFile2Data(file/*, rule*/) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsArrayBuffer(file)
		
		reader.onload = event => {
			const arr = event.target.result
			let data = aExcelArrayBuffer2Json(arr)
			
			const header = []
			/*header=身份证号,姓名,性别,立定跳远,成绩,厘米,评分,测试时间
			身高体重的header特殊，需单独处理
			*/
			for (const [key, val] of Object.entries(data[0])) {
				if (['项目', '单位', '单位_1'].includes(key)) header.push(val)//'单位_1'是因为身高体重的字段里有2个'单位'
				else header.push(key)
			}
			
			if (header.length > 5)//如果是身高体重
			//header=身份证号,姓名,性别,身高(厘米),体重(公斤),测试时间
				header.splice(1, 5, `${header[2]}(${header[3]})`, `${header[4]}(${header[5]})`)
			else header.splice(1, 3, `${header[1]}(${header[3]})`)//header=身份证号,姓名,性别,立定跳远(厘米),测试时间
			
			//把项目名取出，后面用于做excel表头
			//sportName是数组，后面会使用这个数组长度来判断是不是身高体重
			const sportName = header.length > 3 ? [header[1], header[2]] : [header[1]]//身高体重含2个元素
			
			// 整理data，只保留header里的属性
			// header=身份证号,姓名,性别,立定跳远(厘米),测试时间
			data = data.map(el => {
				const newEl = {}
				for (let i = 0, len = header.length; i < len; i ++) {
					if (len > 3) {//判断是不是身高体重
						if (i == 1) Object.assign(newEl, { [header[i]]: el['身高'] })
						else if (i == 2) Object.assign(newEl, { [header[i]]: el['体重'] })
						else Object.assign(newEl, { [header[i]]: el[header[i]] })
					}
					else {
						if (i == 1) Object.assign(newEl, { [header[i]]: el['成绩'] })
						else Object.assign(newEl, { [header[i]]: el[header[i]] })
					}
				}
				return newEl
			})
			
			resolve({//回调完成通过resolve返回数据
				data,
				sportName
			})
		}
		
		reader.onerror = () => {
			reject({
				errMsg: '读取文件出错！'
			})
		}
	})
}

/*******************
选择成绩覆盖*/
function makeChoice(oldData, newData, rule, sportName) {//sportName是数组，身高体重含2个元素
	const lessIsBetter = [
							'50米(秒)',
							'50米往返跑(秒)',
							'800米[超高频]()',
							'800米()',
							'1000米[超高频]()',
							'1000米()',
							'反应时(秒)',
							'篮球运球跑(秒)',
							'足球绕杆跑(秒)',
						]//数值越低成绩越好的项目
	return (() => {
		switch(rule) {
			case 'time':
				if (newData['测试时间'] > oldData['测试时间']) return 'new'
				return 'old'
			case 'score':
				if (sportName.length > 1 && newData['测试时间'] > oldData['测试时间'])return 'new'
				if (lessIsBetter.includes(sportName[0]) && newData[sportName[0]] < oldData[sportName[0]])return 'new'
				if (!lessIsBetter.includes(sportName[0]) && newData[sportName[0]] > oldData[sportName[0]]) return 'new'
				return 'old'
		}
	})()
}

/*********************
去重*/
function removeDuplication(data, rule, sportName) {//sportName是数组，身高体重含2个元素
	const enume = []//身份证号的容器，用于检查是否重复
	const doneData = []//处理完的数据，根据优先原则去除重复身份证号
	data.forEach(el => {
		const idx = enume.indexOf(String(el['测试用户']))//获取重复身份证号的索引
		if (idx > -1) {//如果重复
			const choice = makeChoice(doneData[idx], el, rule, sportName)
			if (choice === 'old');
			else doneData.splice(idx, 1, el)//否则用新的替换
		}
		else {//没有重复，直接推入
			enume.push(String(el['测试用户']))
			doneData.push(el)
		}
	})
	return doneData
}

async function files2Data(files, rule) {//处理多个文件
	const promises = []
	for (let i = 0; i < files.length; i ++) {
		const file = files[i]
		promises.push(aFile2Data(file, rule))
	}
	//使用Promise.all同时处理文件
	const result = await Promise.all(promises).then(val => val).catch(reas => reas)
	if (result.errMsg) return result
	/*
	将同一项目合并成一个*/
	const enume = []
	const allData = []
	result.forEach(el => {
		const idx = enume.indexOf(el.sportName[0])
		if (idx > -1) {
			allData[idx].data.push(...el.data)
		} else {
			allData.push(el)
			enume.push(el.sportName[0])
		}
	})
	/*
	去重*/
	allData.forEach(el => {
		el.data = removeDuplication(el.data, rule, el.sportName)
	})
	
	const outputHeader = ['测试用户']//outputHeader是最终输出的excel的表头
	const totalData = {}//一个总对象，内含所有项目
	allData.forEach(el => {//el是指各个项目
		if (el.sportName.length > 1)//是不是身高体重
			Object.assign(totalData, { [el.sportName[0]]: el.data }, { [el.sportName[1]]: el.data })//把身高体重一分为二
		else Object.assign(totalData, { [el.sportName[0]]: el.data })
		
		outputHeader.push(...el.sportName)//没有了测试时间
	})
	
	return {
		totalData,
		outputHeader//["身份证号", "姓名", "性别", "立定跳远(厘米)", "身高(厘米)", "体重(公斤)", "引体向上(个)"]
	}
}

function getFinalData(data, header) {
	const enume = []
	const finalData = []
	
	for (const [key, val] of Object.entries(data)) {//key是项目如"引体向上(个)"，val是该项目下所有人的成绩
		val.forEach(el => {//对某项下每个人的成绩遍历
			const idx = enume.indexOf(String(el['测试用户']))
			if (idx > -1) {//如果已存在，给属性赋值
				finalData[idx][key] = el[key]
			}
			else {
				const row = {}//如果不存在，新建一条数据
				header.forEach(it => {
					Object.assign(row, { [it]: el[it] || '' })//有值就用，没有就设为空字符
				})
				finalData.push(row)//推入新行
				enume.push(String(el['测试用户']))//推入身份证号，用于检查是否已存在
			}
		})
	}
	return finalData
}

function getURL(data) {//生成object url，浏览器端生成文件的方式，不同于node的fs读写文件路径
	const workbook = xlsx.utils.book_new()
	const sheet = xlsx.utils.json_to_sheet(data)
	xlsx.utils.book_append_sheet(workbook, sheet, '测试成绩汇总')//第3参数为sheet名
	const arr = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
    })
	// const blob = new Blob([arr], { type: "application/vnd.ms-excel" })//此为xls格式，应该用下面一种xlsx
	//注意第一个参数是[arr]！！
	const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
	const url = URL.createObjectURL(blob)
	return url
}

const actions = {
	async raw2Cooked(ctx, payload) {
		const { files, rule } = payload
		const { totalData, outputHeader, errMsg } = await files2Data(files, rule)
		if (errMsg) return { errMsg }
		// console.log(JSON.stringify(totalData))
		const finalData = getFinalData(totalData, outputHeader)
		// console.log(JSON.stringify(finalData))
		const url = getURL(finalData)
		return { url }
	},
}

export default {
	actions,
}

