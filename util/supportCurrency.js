
//轉換
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

//台灣銀行 004
const currencyArrayOf004 = ['USD',
    'HKD',
    'AUD',
    'GBP',
    'CAD',
    'SGD',
    'CHF',
    'JPY',
    'ZAR',
    'SEK',
    'NZD',
    'THB',
    'PHP',
    'IDR',
    'EUR',
    'KRW',
    'VND',
    'MYR',
    'CNY']

//兆豐商銀
const currencyArrayOf017 = [ 'USD',
    'HKD',
    'GBP',
    'JPY',
    'AUD',
    'CAD',
    'SGD',
    'ZAR',
    'SEK',
    'CHF',
    'THB',
    'NZD',
    'EUR',
    'KRW',
    'MYR',
    'IDR',
    'PHP',
    'MOP',
    'VND',
    'CNY' ]

//玉山銀行
const currencyArrayOf808 = [ 'USD',
    'CNY',
    'HKD',
    'JPY',
    'EUR',
    'AUD',
    'CAD',
    'GBP',
    'ZAR',
    'NZD',
    'CHF',
    'SEK',
    'SGD',
    'MXN',
    'THB' ]

//永豐銀行
const currencyArrayOf807 = [ 'USD',
    'JPY',
    'HKD',
    'EUR',
    'GBP',
    'CHF',
    'AUD',
    'SGD',
    'SEK',
    'CAD',
    'THB',
    'ZAR',
    'NZD',
    'MOP',
    'CNY',
    'CNH' ]

//土地銀行 005
const currencyArrayOf005 = [ 'USD',
    'JPY',
    'GBP',
    'HKD',
    'AUD',
    'CAD',
    'SGD',
    'CHF',
    'SEK',
    'ZAR',
    'THB',
    'NZD',
    'EUR',
    'CNY' ]

//華南銀行 008
const currencyArrayOf008 = [ 'USD',
    'HKD',
    'GBP',
    'NZD',
    'AUD',
    'SGD',
    'CHF',
    'CAD',
    'JPY',
    'SEK',
    'ZAR',
    'THP',
    'EUR',
    'CNY',
    'KRW' ]

//彰化銀行 009

const currencyArrayOf009 = [ 'USD',
    'GBP',
    'AUD',
    'HKD',
    'SGD',
    'CAD',
    'CHF',
    'ZAR',
    'SEK',
    'JPY',
    'THB',
    'EUR',
    'NZD',
    'CNY' ]

//富邦銀行 012
const currencyArrayOf012 = [ 'USD',
    'CNY',
    'JPY',
    'EUR',
    'HKD',
    'AUD',
    'ZAR',
    'CAD',
    'GBP',
    'SGD',
    'CHF',
    'NZD',
    'SEK',
    'THB' ]

//103 新光銀行
const currencyArrayOf103 = [ 'USD',
    'JPY',
    'AUD',
    'NZD',
    'HKD',
    'SGD',
    'THB',
    'EUR',
    'GBP',
    'CHF',
    'CAD',
    'SEK',
    'ZAR',
    'CNY',
    'TRY',
    'MXN' ]

// 013 國泰世華
const currencyArrayOf013 = [ 'USD',
    'CNY',
    'HKD',
    'GBP',
    'CHF',
    'AUD',
    'SGD',
    'CAD',
    'SEK',
    'ZAR',
    'JPY',
    'DKK',
    'THB',
    'NZD',
    'EUR',
    'TRY' ]

// const testName = 'USD'
// if (currencyArrayOf017.includes(testName)){
//     console.log('yes')
// }else{
//     console.log('no')
// }

module.exports.currencyArrayOf004 = currencyArrayOf004
module.exports.currencyArrayOf017 = currencyArrayOf017
module.exports.currencyArrayOf808 = currencyArrayOf808
module.exports.currencyArrayOf807 = currencyArrayOf807
module.exports.currencyArrayOf005 = currencyArrayOf005
module.exports.currencyArrayOf008 = currencyArrayOf008
module.exports.currencyArrayOf009 = currencyArrayOf009
module.exports.currencyArrayOf012 = currencyArrayOf012
module.exports.currencyArrayOf103 = currencyArrayOf103
module.exports.currencyArrayOf013 = currencyArrayOf013


module.exports.chineseToEnglishDict = chineseToEnglishDict


