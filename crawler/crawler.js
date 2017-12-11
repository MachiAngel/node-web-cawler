const cheerio = require("cheerio")
const moment = require("moment")
const axios = require('axios')
const phantom = require('phantom')

// const Bank = require('../model/bank.js')
// const Rate = require('../model/rate.js')
const supportCurrency = require('../util/supportCurrency')
const {convertStringToNumberFunction} = require('../util/publicfuction')

const lateTime = async (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        },time)
    })
}

const getPage$ = async (url) => {
    try{
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)
        //console.log(response.data)
        return $
    }catch (e){
        throw new Error(`can not get $ from ${url}`)
    }
}

const getDynamicPage$ = async (url) => {
    try{
        //取得instance
        const instance = await phantom.create()
        const page = await instance.createPage()
        
        //打開網頁
        const status = await page.open(url)
        if (status !== 'success') {
            throw new Error()
        }
        //等待3秒 html的js才會加載完畢
        await lateTime(3000)
        //獲取網頁
        const content = await page.property('content')
        //console.log(content)
        await instance.exit()
        const $ = cheerio.load(content)
        return $
    }catch (e){
        await instance.exit()
        throw new Error(`can not get $ from ${url}`)
    }
}


const getDynamicPageForFristBank$ = async (url) => {
    try{
        //取得instance
        const instance = await phantom.create()
        const page = await instance.createPage()
        await page.setting('javascriptEnabled')
        page.viewportSize = { width: 1920, height: 1080 }
        page.on('onResourceRequested', function (requestData, networkRequest) {
            console.log(requestData.url)
        });
        
        //打開網頁
        const status = await page.open(url)
        if (status !== 'success') {
            throw new Error()
        }
        //等待3秒 html的js才會加載完畢
        await lateTime(12000)
        //獲取網頁
        
        
        
        const content = await page.property('content')
        page.render('bank.jpeg', {format: 'jpeg', quality: '100'})//
        const cons = await page.evaluate(function () {
            return document.getElementsByTagName('html')[0].outerHTML
        })
        console.log(cons)
        await instance.exit()
        const $ = cheerio.load(content)
        return $
    }catch (e){
        await instance.exit()
        throw new Error(`can not get $ from ${url}`)
    }
}

//807 永豐銀行即時資料
const getRealTimeResultFromSinopacBank = async () => {
    const url = `https://bank.sinopac.com/MMA8/bank/html/rate/bank_ExchangeRate.html`
    const $ = await getDynamicPage$(url)
    
    const timeString = $('#tab1_date').text().trim()
    if (timeString === '') {
        console.log('拿不到永豐銀行即時時間')
        return undefined
    }
    const dateObj = moment(timeString, 'YYYY/MM/DD h:mm')
    const resultArray = pasreRealTimeRateForSinopacBank($, dateObj)
    
    if (resultArray.length !== 16) {
        return undefined
    }
    return {resultTime:dateObj, resultArray:resultArray}
}


const pasreRealTimeRateForSinopacBank = ($, dateObj) => {
    const trs = $('.data-table1').find('tr')
    const resultArray = []
    trs.each((i,tr) => {
        //18個tr  只有後面16個是匯率 不加入也行 下面也會判斷
        if (i === 0 || i === 1) {
            return
        }
        const dict = {}
        dict['bankName'] = '永豐銀行'
        dict['bankCode'] = '807'
        dict['time'] = dateObj
        const tds = $(tr).find('td')
        //拿到貨幣名稱
        const originCurrencyName = $(tds[0]).text().trim()
        const sliceName = originCurrencyName.substring(originCurrencyName.length-1,originCurrencyName.length-4)
        
        //只要發現幣別沒在support裡面,就return換下一個tr
        if (!supportCurrency.currencyArrayOf807.includes(sliceName)) {
            return
        }
        
        dict['currencyName'] = sliceName
        //即期買入
        const spotBuying = $(tds[1]).text()
        dict['spotBuying'] = convertStringToNumberFunction(spotBuying)

        //即期賣匯
        const spotSelling = $(tds[2]).text()
        dict['spotSelling'] = convertStringToNumberFunction(spotSelling)

        //現金買入
        const cashBuying = $(tds[3]).text()
        dict['cashBuying'] = convertStringToNumberFunction(cashBuying)

        //現金賣匯
        const cashSelling = $(tds[4]).text()
        dict['cashSelling'] = convertStringToNumberFunction(cashSelling)
        resultArray.push(dict)
    })
    //console.log(resultArray)
    if (resultArray.length != supportCurrency.currencyArrayOf807.length) {
        return []
    }
    return resultArray
}


//808 玉山銀行即時資料 - return dict contains time and result array
const getRealTimeResultFromEsunBank = async () => {
    const url = `https://www.esunbank.com.tw/bank/personal/deposit/rate/forex/foreign-exchange-rates`
    const $ = await getPage$(url)
    
    const timeString = $('#LbQuoteTime').text().trim()
    console.log(timeString)
    if (timeString === '') {
        console.log('拿不到玉山銀行即時時間')
        return undefined
    }
    
    const dateObj = moment(timeString, 'YYYY年MM月DD日 h:mm')
    //const dateObj = moment(timeString, 'YYYY/MM/DD h:mm')
    console.log(dateObj)
    
    const resultArray = pasreRealTimeRateForEsunBank($, dateObj)
    if (resultArray.length === 0) {
        return undefined
    }
    return {resultTime:dateObj, resultArray:resultArray}
}

//808 玉山銀行即時資料 - pasre Html
const pasreRealTimeRateForEsunBank = ($, dateObj) => {
    const trs = $('.tableContent-light')
    const resultArray = []
    trs.each((i,tr) => {
        const dict = {}
        
        dict['bankName'] = '玉山銀行'
        dict['bankCode'] = '808'
        dict['time'] = dateObj
        const tds = $(tr).find('td')
        //拿到貨幣名稱
        const originCurrencyName = $(tds[0]).text().trim()
        const sliceName = originCurrencyName.substring(originCurrencyName.length-1,originCurrencyName.length-4)
        console.log(sliceName)
        if (!supportCurrency.currencyArrayOf808.includes(sliceName)) {
            return undefined
        }
        dict['currencyName'] = sliceName
        //即期買入
        const spotBuying = $(tds[1]).text()
        dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
    
        //即期賣匯
        const spotSelling = $(tds[2]).text()
        dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
        //現金買入
        const cashBuying = $(tds[3]).text()
        dict['cashBuying'] = convertStringToNumberFunction(cashBuying)
        
        //現金賣匯
        const cashSelling = $(tds[4]).text()
        dict['cashSelling'] = convertStringToNumberFunction(cashSelling)
        resultArray.push(dict)
    })
    if (resultArray.length != supportCurrency.currencyArrayOf808.length) {
        return []
    }
    return resultArray
}

//007 第一銀行
// const getRealTimeResultFromFirstBank = async() => {
//     const url = `https://www.firstbank.com.tw/servlet/fbweb/ForExRatesInquiry`
//     const $ = await getDynamicPageForFristBank$(url)
//     // const $ = await getPage$(url)
//
//     // console.log($('h3.tab-title').text())
//
//     const test = $('#table1').children().length
//     console.log(test)
//     // console.log($(test).text())
//     return test
//
// }



//017 兆豐商銀即時資料
const getRealTimeResultFromMegaBank = async () => {
    const url = `https://wwwfile.megabank.com.tw/rates/M001/viewF.asp`
    const $ = await getDynamicPage$(url)
    
    const dateDateString = $('#dataDate').text().trim()
    const dateTimeString = $('#dataTime').text().trim()
    
    if (dateDateString === '' || dateTimeString === '') {
        console.log('拿不到兆豐銀行即時時間')
        return undefined
    }
    
    const timeString = `${dateDateString} ${dateTimeString}`
    const dateObj = moment(timeString, 'YYYY/MM/DD h:mm')
    const resultArray = pasreRealTimeRateForMegaBank($, dateObj)
    if (resultArray.length === 0) {
        return undefined
    }
    return {resultTime:dateObj, resultArray:resultArray}
}

const pasreRealTimeRateForMegaBank = ($, dateObj) => {
    const resultArray = []
    
    const trs = $('#contentTbody').find('tr')
    console.log(trs.length)
    trs.each((i,tr) => {
        const dict = {}
        dict['bankName'] = '兆豐商銀'
        dict['bankCode'] = '017'
        dict['time'] = dateObj
        const tds = $(tr).find('td')
        //拿到貨幣名稱
        const originCurrencyName = $(tds[0]).text()
        const sliceName = originCurrencyName.substring(originCurrencyName.length-1,originCurrencyName.length-4)
        if (!supportCurrency.currencyArrayOf017.includes(sliceName)) {
            return
        }
        dict['currencyName'] = sliceName
        //即期買入
        const spotBuying = $(tds[1]).text()
        dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
        //現金買入
        const cashBuying = $(tds[2]).text()
        dict['cashBuying'] = convertStringToNumberFunction(cashBuying)
        
        //即期賣匯
        const spotSelling = $(tds[3]).text()
        dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        //現金賣匯
        const cashSelling = $(tds[4]).text()
        dict['cashSelling'] = convertStringToNumberFunction(cashSelling)
        resultArray.push(dict)
    })
    return resultArray
}

//004 台灣銀行歷史資料 - 拿到並整理成array
const getHistoryResultFromTaiwanBank = async (currencyName) => {
    
    const url = `http://rate.bot.com.tw/xrt/quote/l6m/${currencyName}`
    const $ = await getPage$(url)
    const resultArray = pasreHistoryRateForTaiwanBank($, currencyName)
    return resultArray
    
}
//004 台灣銀行歷史資料 - 拿到html解析 成各種幣別即時資料組成的array
const pasreHistoryRateForTaiwanBank = ($, currencyName) => {
    //銀行名字
    
    const name = $('.pull-left').text()
    //const sliceName = name.substring(name.length - 1, name.length - 4);
    //拿到半年內每天的資料
    const trs = $('tbody').find('tr')
    console.log(trs.length)
    resultArray = []
    //每個tr 美金都是每日資料
    trs.each((i, tr) => {
        dict = {}
        //1.拿到該記錄時間
        const timeString = $(tr).find('td').first().text()
        const dateObj = moment(timeString, 'YYYY/MM/DD')
        //拿到現金
        const cash = $(tr).find('.rate-content-cash, .text-right .print_table-cell')
        //現金買入
        const cashBuying = cash.first().text()
        //現金賣出
        const cashSelling = cash.last().text()
        // console.log(`現金買入:${cashBuying}`)
        // console.log(`現金賣出:${cashSelling}`)
        //拿到即期
        const spot = $(tr).find('.rate-content-sight, .hidden-phone')
        //即期買入
        const spotBuying = spot.first().text()
        //即期賣出
        const spotSelling = spot.last().text()
        
        // console.log(`即期買入:${spotBuying}`)
        // console.log(`即期賣出:${spotSelling}`)
        // console.log(sliceName)
        
        dict['currencyName'] = currencyName
        dict['bankName'] = '台灣銀行'
        dict['bankCode'] = '004'
        dict['time'] = dateObj
        dict['cashBuying'] = convertStringToNumberFunction(cashBuying)
        dict['cashSelling'] = convertStringToNumberFunction(cashSelling)
        dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
        if (dict['cashBuying'] === 0 &&
            dict['cashSelling'] === 0 &&
            dict['spotBuying'] === 0 &&
            dict['spotSelling'] === 0) {
            
        }else {
            resultArray.push(dict)
        }
        
        //console.log(dict)
    })
    
    return resultArray
}
//004 台灣銀行即時資料 - 返回一個promise array 包含各種幣值的即時報價
const getRealTimeResultFromTaiwanBank = async () => {
    const url = `http://rate.bot.com.tw/xrt?Lang=zh-TW`
    const $ = await getPage$(url)
    const timeString = $('.time').text()
    const dateObj = moment(timeString, 'YYYY/MM/DD h:mm')
    
    const resultArray = pasreRealTimeRateForTaiwanBank($)
    
    if (resultArray.length === 0) {
        return undefined
    }
    const resultDict = {resultTime:dateObj, resultArray:resultArray}
    return resultDict
}
//004 台灣銀行即時資料 - 拿到html解析 成各種幣別即時資料組成的array
const pasreRealTimeRateForTaiwanBank = ($) => {
    const resultArray = []
    //拿到時間 連時間都沒拿到 直接return
    const timeString = $('.time').text()
    if (timeString === '') {
      return resultArray
    }
    //轉換時間
    const dateObj = moment(timeString, 'YYYY/MM/DD h:mm')
    console.log(dateObj)
    //拿到19個國家幣值的tr
    const trs = $('tbody').find('tr')
    //console.log(trs.length)
    
    trs.each((i,tr) => {
        // const oneTr = trs[0]
        const dict = {}
        //名字
        const name = $(tr).find('.print_show').text().trim()
        //配合台灣銀行html拿到該幣別資料 ex: 美金 (USD) -> USD
        const sliceName = name.substring(name.length-1,name.length-4);
        
        dict['time'] = dateObj
        dict['currencyName'] = sliceName
        //本行現金買入
        const cashBuy = $(trs[0]).find('[data-table="本行現金買入"]').first().text().trim()
        
        dict['cashBuying'] = convertStringToNumberFunction(cashBuy)
        //"本行現金賣出"
        const cashSelling = $(trs[0]).find('[data-table="本行現金賣出"]').first().text().trim()
        dict['cashSelling'] = convertStringToNumberFunction(cashSelling)
        
        //"本行即期買入"
        const spotBuy = $(trs[0]).find('[data-table="本行即期買入"]').first().text().trim()
        
        dict['spotBuying'] = convertStringToNumberFunction(spotBuy)
        //"本行即期賣出"
        const spotSelling = $(trs[0]).find('[data-table="本行即期賣出"]').first().text().trim()
        
        dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        dict['bankName'] = '台灣銀行'
        dict['bankCode'] = '004'
        resultArray.push(dict)
    })
    return resultArray
    
}


// getRealTimeResultFromEsunBank()
//     .then((result) => {
//         console.log(result)
//     })

// getRealTimeResultFromFirstBank()
//     .then((result) => {
//         console.log('call back started')
//         console.log(result)
//     })


// getHistoryResultFromTaiwanBank('USD')
//     .then((resultArray) => {
//         console.log(resultArray)
//     }).catch((e) => {
//     console.log(e)
// })

//台灣銀行
module.exports.getHistoryResultFromTaiwanBank = getHistoryResultFromTaiwanBank
module.exports.getRealTimeResultFromTaiwanBank = getRealTimeResultFromTaiwanBank

//兆豐商銀
module.exports.getRealTimeResultFromMegaBank = getRealTimeResultFromMegaBank

//玉山銀行
module.exports.getRealTimeResultFromEsunBank = getRealTimeResultFromEsunBank
//永豐銀行
module.exports.getRealTimeResultFromSinopacBank = getRealTimeResultFromSinopacBank

// const rate = new Rate(dict)
// Bank.findOne({name:'台灣銀行'}).then()
//     .then((bank) => {
//         if (bank) {
//             rate.bank = bank
//             bank.rates.push(rate)
//             Promise.all([bank.save(),rate.save()])
//                 .then(() => {
//                     console.log(`save success:${i}`)
//
//                 }).catch((e) => {
//                 console.log(e)
//             })
//         }else {
//         }
//     }).catch((e) => {
//
// })
