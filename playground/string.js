

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

const cn = chineseToEnglishDict['人民']
console.log(cn)

