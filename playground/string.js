

var name = '美金(USD)'

// const sliceName = name.substring(name.length-1,name.length-4)

// console.log(sliceName)
function getPrintableChars(str) {
    const matches = str.match("[a-zA-Z]");
    let a = '';
    matches.forEach(item => item && (a += item));
    
}

// var str = getPrintableChars(name)
// console.log(str)

//const url = 'https://ebank.landbank.com.tw/infor/infor.aspx?__eventtarget=querycurrency'
// const url = 'https://ebank.landbank.com.tw/infor/infor.aspx?__安安'
// const encodeString = encodeURI(url)
// console.log(encodeString)


const chineseToEnglishDict = {
    '美金':'USD',
    '日圓':'JPY',
    '英鎊':'GBP',
    '港幣':'HKD',
    '澳幣':'AUD',
    '加拿大幣':'CAD',
    '新加坡幣':'SGD',
    '瑞士法郎':'CHF',
    '瑞典幣':'SEK',
    '南非幣':'ZAR',
    '泰幣':'THB',
    '紐西蘭幣':'NZD',
    '歐元':'EUR',
    '人民幣':'CNY'
}

// const cn = chineseToEnglishDict['人民']
// console.log(cn)

// const a = '#formpop:datagrid_DataGridBody'

const originCurrencyName = 'abcd(USD)'
const sliceName = originCurrencyName.slice(4,8)
// console.log(sliceName)

const a = '查詢日期：2017-12-18 19:46:28 \t \t \t \t 掛牌日期：106/12/18 16:06'

const indexKey = a.indexOf('掛')
const wannaString = a.slice(indexKey+5,a.length)
console.log(wannaString)