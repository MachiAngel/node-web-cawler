const cheerio = require("cheerio")
const moment = require("moment")
const axios = require('axios')
const phantom = require('phantom')
const request = require('request')
const iconv = require('iconv-lite')

// const Bank = require('../model/bank.js')
// const Rate = require('../model/rate.js')
const supportCurrency = require('../util/supportCurrency')
const {convertStringToNumberFunction} = require('../util/publicfuction')

function waitUntil(asyncTest) {
    return new Promise(function(resolve, reject) {
        function wait() {
            console.log('loop...')
            asyncTest().then(function(value) {
                console.log('value', value)
                if (value === true) {
                    resolve();
                } else {
                    setTimeout(wait, 100);
                }
            }).catch(function(e) {
                console.log('Error found. Rejecting.', e);
                reject();
            });
        }
        wait();
    });
}


const lateTime = async (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        },time)
    })
}

// const requestPage$ = async (url) => {
//     const config = {
//         url: "https://ebank.landbank.com.tw/infor/infor.aspx?eventtarget=querycurrency",
//         method: "GET"
//     }
//     request(config, function(error, response, body) {
//         if (error || !body) {
//             console.log(error.message)
//             return
//         }else{
//
//             // 爬完網頁後要做的事情
//             console.log(body)
//         }
//     })
//
// }
// requestPage$()

const getPage$ = async (url) => {
    try{
        const response = await axios.get(url)
        
        const $ = cheerio.load(response.data)
        //console.log(response.data)
        return $
    }catch (e){
        console.log(e.message)
        throw new Error(`can not get $ from ${url}`)
    }
}

const getPageTest$ = async (url) => {
    try{
        const response = await axios.get(url)
        
        const $ = cheerio.load(response.data)
        console.log(response.data)
        return $
    }catch (e){
        console.log(e.message)
        throw new Error(`can not get $ from ${url}`)
    }
}

//for 008
const getBig5Page$ = async (url) => {
    try{
        const response = await axios.get(url,{ responseType: 'arraybuffer' })
        const body = iconv.decode(response.data, 'BIG5')
        const $ = cheerio.load(body)
        return $
    }catch (e){
        console.log(e.message)
        throw new Error(`can not get $ from ${url}`)
    }
}

const getDynamicPage$ = async (url) => {
    try{
        //取得instance
        const instance = await phantom.create()
        const page = await instance.createPage()
        //page.viewportSize = { width: 1920, height: 1080 }
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
        //page.render('bank.jpeg', {format: 'jpeg', quality: '100'})//
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
        //page.viewportSize = { width: 1920, height: 1080 }
        //打開網頁
        const status = await page.open(url)
        if (status !== 'success') {
            throw new Error()
        }
        //等待3秒 html的js才會加載完畢
        await lateTime(2000)
        //獲取網頁
        const content = await page.property('content')
        console.log(content)
        // waitUntil(function() {
        //     return page.evaluate(function() {
        //         return document.querySelectorAll('tr').length > 1
        //     })
        // }).then(function(){
        //     console.log(content)
        //
        // })
        // console.log('finish')
        await instance.exit()
        const $ = cheerio.load(content)
        return $
        
    }catch (e){
        await instance.exit()
        throw new Error(`can not get $ from ${url}`)
    }
}

//013 國泰世華即時資料 - get data
const getRealTimeResultFromCathayBank = async () => {
    const url = 'https://www.cathaybk.com.tw/cathaybk/personal/exchange/product/currency-billboard/'
    const $ = await getPage$(url)
    
    const originTimeString = $('#layout_0_rightcontent_1_firsttab01_1_tab_rate_realtime').find('p').text().trim()
    if (originTimeString === '') {
        console.log('拿不到國泰世華即時時間')
        return undefined
    }
    const dateObj = moment(originTimeString, 'YYYY年MM月DD日h時mm分')
    
    const resultArray = pasreRealTimeRateForCathayBank($, dateObj)
    if (resultArray.length === 0) {
        return undefined
    }
    return {resultTime:dateObj, resultArray:resultArray}
}

//013 國泰世華即時資料 - pasre Html
const pasreRealTimeRateForCathayBank = ($, dateObj) => {
    const trs = $('#layout_0_rightcontent_1_firsttab01_1_tab_rate_realtime').find('table').find('tbody').find('tr')
    console.log(trs.length)
    if (trs.length !== 21) {
        return []
    }
    const resultArray = []
    var dict = {}
    
    trs.each((i,tr) => {
        dict['bankName'] = '國泰世華'
        dict['bankCode'] = '013'
        dict['time'] = dateObj
        
        const tds = $(tr).find('td')
        //美金
        if (i === 0 || i === 1) {
            dict['currencyName'] = 'USD'
            if (i === 0) {
                //即期買入
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
                
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
            if (i === 1) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
                
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        
        if (i === 2 || i === 3) {
            dict['currencyName'] = 'CNY'
            if (i === 2 ) {
                //即期買匯
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
                
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
            
            if (i === 3) {
                //現金買入
                const cashBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(cashBuying)
                
                //現金賣匯
                const cashSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(cashSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        
        if (i === 4 || i === 5) {
            dict['currencyName'] = 'HKD'
            if (i === 4 ) {
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
                
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
            
            if (i === 5) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
                
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        
        if (i === 6) {
            dict['currencyName'] = 'GBP'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 7) {
            dict['currencyName'] = 'CHF'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 8) {
            dict['currencyName'] = 'AUD'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 9) {
            dict['currencyName'] = 'SGD'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 10) {
            dict['currencyName'] = 'CAD'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 11) {
            dict['currencyName'] = 'SEK'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 12) {
            dict['currencyName'] = 'ZAR'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 13 || i === 14) {
            dict['currencyName'] = 'JPY'
            if (i === 13 ) {
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)

                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }

            if (i === 14) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)

                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        if (i === 15) {
            dict['currencyName'] = 'DKK'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 16) {
            dict['currencyName'] = 'THB'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 17) {
            dict['currencyName'] = 'NZD'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 18 || i === 19) {
            dict['currencyName'] = 'EUR'
            if (i === 17 ) {
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 18) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        
        if (i === 20) {
            dict['currencyName'] = 'TRY'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        
    })
    
    if (resultArray.length != supportCurrency.currencyArrayOf013.length) {
        return []
    }
    return resultArray
}


//103 新光銀行即時資料 - get data
const getRealTimeResultFromSkBank = async () => {
    const url = 'https://rate.skbank.com.tw/SKBank_Accessible/ExchangeRate'
    const $ = await getPage$(url)
    
    const originTimeString = $('caption').text().trim()
    //console.log(originTimeString)
    
    if (originTimeString === '') {
        console.log('拿不到富邦銀行即時時間')
        return undefined
    }
    const dateObj = moment(originTimeString, 'YYYY/MM/DD h:mm')
    
    const resultArray = pasreRealTimeRateForSkBank($, dateObj)
    if (resultArray.length === 0) {
        return undefined
    }
    return {resultTime:dateObj, resultArray:resultArray}
}

//103 新光銀行即時資料 - pasre Html
const pasreRealTimeRateForSkBank = ($, dateObj) => {
    const trs = $('table tbody tr')
    const resultArray = []
    trs.each((i,tr) => {
        const dict = {}
        
        dict['bankName'] = '新光銀行'
        dict['bankCode'] = '103'
        dict['time'] = dateObj
        const tds = $(tr).find('td')
        //拿到貨幣名稱
        const currencyName = $(tds[0]).text().trim()
        if (!supportCurrency.currencyArrayOf103.includes(currencyName)) {
            return undefined
        }
        dict['currencyName'] = currencyName
        //即期買入
        const spotBuying = $(tds[2]).text()
        dict['spotBuying'] = convertStringToNumberFunction(spotBuying)

        //即期賣匯
        const spotSelling = $(tds[3]).text()
        dict['spotSelling'] = convertStringToNumberFunction(spotSelling)

        //現金買入
        const cashBuying = $(tds[4]).text()
        dict['cashBuying'] = convertStringToNumberFunction(cashBuying)

        //現金賣匯
        const cashSelling = $(tds[5]).text()
        dict['cashSelling'] = convertStringToNumberFunction(cashSelling)
        resultArray.push(dict)
    })
    
    if (resultArray.length != supportCurrency.currencyArrayOf103.length) {
        return []
    }
    return resultArray
}


//012 富邦銀行即時資料
const getRealTimeResultFromFubonBank = async () => {
    // const url = `https://www.fubon.com/banking/personal/deposit/exchange_rate/exchange_rate_tw.htm`
    const url = 'https://www.fubon.com/Fubon_Portal/banking/Personal/deposit/exchange_rate/exchange_rate1.jsp'
    const $ = await getPage$(url)
    
    const originTimeString = $('.ico-date').text().trim()
    console.log(originTimeString)
    if (originTimeString === '') {
        console.log('拿不到富邦銀行即時時間')
        return undefined
    }
    
    const dateObj = moment(originTimeString, 'YYYY/MM/DD h:mm')
    const resultArray = pasreRealTimeRateForFubonBank($, dateObj)
    if (resultArray.length === 0) {
        return undefined
    }
    return {resultTime:dateObj, resultArray:resultArray}
}

//012 富邦銀行 - parse html
const pasreRealTimeRateForFubonBank = ($, dateObj) => {
    const trs = $('.rate-table').find('tbody tr')
    const resultArray = []
    trs.each((i,tr) => {
        const dict = {}
        
        dict['bankName'] = '富邦銀行'
        dict['bankCode'] = '012'
        dict['time'] = dateObj
        const tds = $(tr).find('td')
        //拿到貨幣名稱
        const originCurrencyName = $(tds[1]).text().trim()
        const sliceName = originCurrencyName.substring(originCurrencyName.length-1,originCurrencyName.length-4)
        
        if (!supportCurrency.currencyArrayOf012.includes(sliceName)) {
            return undefined
        }
        dict['currencyName'] = sliceName
        //即期買入
        const spot = $(tds[3]).text().trim()
        const spotArray = spot.split('        ')
        if (spotArray.length == 2 ) {
            //即期買匯
            dict['spotBuying'] = convertStringToNumberFunction(spotArray[0].trim())
            //即期賣匯
            dict['spotSelling'] = convertStringToNumberFunction(spotArray[1].trim())
        }else {
            dict['spotBuying'] = 0
            dict['spotSelling'] = 0
        }
        const cash = $(tds[4]).text().trim()
        const cashArray = cash.split('       ')
        if (cashArray.length == 2 ) {
            //即期買匯
            dict['cashBuying'] = convertStringToNumberFunction(cashArray[0].trim())
            //即期賣匯
            dict['cashSelling'] = convertStringToNumberFunction(cashArray[1].trim())
        }else if (cashArray.length == 1 ){
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
        }
        
        if (dict.spotBuying === 0 && dict.spotSelling === 0 && dict.cashBuying === 0 && dict.cashSelling === 0 ){
            return
        }
        resultArray.push(dict)
    })
    
    if (resultArray.length != supportCurrency.currencyArrayOf012.length) {
        return []
    }
    return resultArray
}

//009 彰化銀行即時資料
const getRealTimeResultFromChanghuaBank = async () => {
    const url = `https://www.bankchb.com/chb_accessibility/G0100.jsp`
    const $ = await getPage$(url)
    
    const originTimeString = $('div table thead').find('td').last().text().trim()
    
    if (originTimeString === '') {
        console.log('拿不到彰化銀行即時時間')
        return undefined
    }
    const fixedTimeString = originTimeString.replace('資料更新時間: ','')
    
    if (fixedTimeString === '') {
        console.log('拿不到華南銀行即時時間')
        return undefined
    }

    const dateObj = moment(fixedTimeString, 'YYYY/MM/DD  h:mm')
    const resultArray = parseRealTimeRateForChangHuaBank($, dateObj)
    if (resultArray.length === 0) {
        return undefined
    }
    return {resultTime:dateObj, resultArray:resultArray}
}

//009 彰化銀行 - parse
const parseRealTimeRateForChangHuaBank = ($, dateObj) => {
    const trs = $('div table tbody').find('tr')
    if (trs.length !== 20) {
        return []
    }
    
    const resultArray = []
    
    var dict = {}
    
    trs.each((i,tr) => {
        dict['bankName'] = '彰化銀行'
        dict['bankCode'] = '009'
        dict['time'] = dateObj
        if (i === 0 ) {
            return
        }
        const tds = $(tr).find('td')
        //美金
        if (i === 1 || i === 2) {
            dict['currencyName'] = 'USD'
            if (i === 1) {
                //即期買入
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)

                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
            if (i === 2) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)

                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        if (i === 3) {
            dict['currencyName'] = 'GBP'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 4) {
            dict['currencyName'] = 'AUD'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 5 || i === 6) {
            dict['currencyName'] = 'HKD'
            if (i === 5 ) {
                //即期買匯
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 6) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        if (i === 7) {
            dict['currencyName'] = 'SGD'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 8) {
            dict['currencyName'] = 'CAD'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 9) {
            dict['currencyName'] = 'CHF'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 10) {
            dict['currencyName'] = 'ZAR'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 11) {
            dict['currencyName'] = 'SEK'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 12 || i === 13) {
            dict['currencyName'] = 'JPY'
            if (i === 12 ) {
                //即期買匯
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 13) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        if (i === 14) {
            dict['currencyName'] = 'THB'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 15 || i === 16) {
            dict['currencyName'] = 'EUR'
            if (i === 15 ) {
                //即期買匯
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 16) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        if (i === 17) {
            dict['currencyName'] = 'NZD'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
        
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 18 || i === 19) {
            dict['currencyName'] = 'CNY'
            if (i === 18 ) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
    
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 19) {
                //即期買匯
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
    
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
    })
    
    if (resultArray.length != supportCurrency.currencyArrayOf009.length) {
        return []
    }
    return resultArray
}


//008 華南銀行即時資料
const getRealTimeResultFromHuaNanBank = async () => {
    const url = `https://ibank.hncb.com.tw/netbank/pages/jsp/ExtSel/RTExange.html`
    const $ = await getBig5Page$(url)
    
    const originTimeString = $('.formtable_subject15rb').last().text().trim()
    if (originTimeString === '') {
        console.log('拿不到華南銀行即時時間')
        return undefined
    }
    const fixedTimeString = originTimeString.replace('資料生效時間：','')
    if (fixedTimeString === '') {
        console.log('拿不到華南銀行即時時間')
        return undefined
    }
    
    const dateObj = moment(fixedTimeString, 'YYYY/MM/DD  h:mm')
    const resultArray = parseRealTimeRateForHuaNanBank($, dateObj)
    if (resultArray.length === 0) {
        return undefined
    }
    return {resultTime:dateObj, resultArray:resultArray}
}
//008 華南銀行 - parse
const parseRealTimeRateForHuaNanBank = ($, dateObj) => {
    const tables = $('table')
    const targetTable = tables[3]
    const trs = $(targetTable).find('tr')
    if (trs.length !== 24) {
        return []
    }
    const resultArray = []
    
    var dict = {}
    
    trs.each((i,tr) => {
        dict['bankName'] = '華南銀行'
        dict['bankCode'] = '008'
        dict['time'] = dateObj
        if (i === 0 || i === 24) {
            return
        }
    
        const tds = $(tr).find('td')
        //美金
        if (i === 1 || i === 2) {
            dict['currencyName'] = 'USD'
            if (i === 1) {
                //即期買入
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
    
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
            if (i === 2) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
    
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
    
        if (i === 3 || i === 4) {
            dict['currencyName'] = 'HKD'
            if (i === 3 ) {
                //即期買匯
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 4) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
    
        if (i === 5 || i === 6) {
            dict['currencyName'] = 'GBP'
            if (i === 5 ) {
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 6) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        
        if (i === 7) {
            dict['currencyName'] = 'NZD'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
    
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
    
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
    
        if (i === 8 || i === 9) {
            dict['currencyName'] = 'AUD'
            if (i === 8 ) {
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 9) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
    
        if (i === 10) {
            dict['currencyName'] = 'SGD'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 11) {
            dict['currencyName'] = 'CHF'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
    
        if (i === 12 || i === 13) {
            dict['currencyName'] = 'CAD'
            if (i === 12) {
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 13) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
    
        if (i === 14 || i === 15) {
            dict['currencyName'] = 'JPY'
            if (i === 14) {
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 15) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
    
        if (i === 16) {
            dict['currencyName'] = 'SEK'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
    
        if (i === 17) {
            dict['currencyName'] = 'ZAR'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 18) {
            dict['currencyName'] = 'THP'
            //即期買匯
            const spotBuying = $(tds[1]).text()
            dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
        
            //即期賣匯
            const spotSelling = $(tds[2]).text()
            dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            dict['cashBuying'] = 0
            dict['cashSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        if (i === 19 || i === 20) {
            dict['currencyName'] = 'EUR'
            if (i === 19) {
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 20) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
        
        if (i === 21 || i === 22) {
            dict['currencyName'] = 'CNY'
            if (i === 21) {
                const spotBuying = $(tds[1]).text()
                dict['spotBuying'] = convertStringToNumberFunction(spotBuying)
            
                //即期賣匯
                const spotSelling = $(tds[2]).text()
                dict['spotSelling'] = convertStringToNumberFunction(spotSelling)
            }
        
            if (i === 22) {
                //現金買入
                const spotBuying = $(tds[1]).text()
                dict['cashBuying'] = convertStringToNumberFunction(spotBuying)
            
                //現金賣匯
                const spotSelling = $(tds[2]).text()
                dict['cashSelling'] = convertStringToNumberFunction(spotSelling)
                resultArray.push(dict)
                dict = {}
                return
            }
        }
    
        if (i === 23) {
            dict['currencyName'] = 'KRW'
            //即期買匯
            const cashBuying = $(tds[1]).text()
            dict['cashBuying'] = convertStringToNumberFunction(cashBuying)
        
            //即期賣匯
            const cashSelling = $(tds[2]).text()
            dict['cashSelling'] = convertStringToNumberFunction(cashSelling)
            
            dict['spotBuying'] = 0
            dict['spotSelling'] = 0
            resultArray.push(dict)
            dict = {}
            return
        }
        
    })
    
    
    if (resultArray.length != supportCurrency.currencyArrayOf008.length) {
        return []
    }
    return resultArray
}



//005 土地銀行即時資料
const getRealTimeResultFromLandBank = async () => {
    const url = `https://ebank.landbank.com.tw/infor/infor.aspx?__eventtarget=querycurrency`
    const $ = await getDynamicPage$(url)
    
    const timeString = $('#TbDateTime').text()
    console.log(timeString)
    if (timeString === '') {
        console.log('拿不到玉山銀行即時時間')
        return undefined
    }
    const dateObj = moment(timeString, 'YYYY/MM/DD h:mm')
    console.log(dateObj)
    const resultArray = pasreRealTimeRateForLandBank($, dateObj)

    if (resultArray.length === 0) {
        return undefined
    }
    const resultDict = {resultTime:dateObj, resultArray:resultArray}
    return resultDict
}
const pasreRealTimeRateForLandBank = ($, dateObj) => {
    const trs = $('.disptab').find('tr')
    console.log(trs.length)
    const resultArray = []
    trs.each((i,tr) => {
        //16個tr  只有後面14個是匯率 不加入也行 下面也會判斷
        if (i === 0 || i === 1) {
            return
        }
        const dict = {}
        dict['bankName'] = '土地銀行'
        dict['bankCode'] = '005'
        dict['time'] = dateObj
        const tds = $(tr).find('td')
        //拿到貨幣名稱
        const originCurrencyName = $(tds[0]).text().trim()
        //貨幣名稱中文轉英文
        const translateName = supportCurrency.chineseToEnglishDict[`${originCurrencyName}`]
        
        //只要發現幣別沒在support裡面,就return換下一個tr
        if (!supportCurrency.currencyArrayOf005.includes(translateName)) {
            return
        }

        dict['currencyName'] = translateName
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
    
    if (resultArray.length != supportCurrency.currencyArrayOf005.length) {
        return []
    }
    return resultArray
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
    //console.log(dateObj)
    
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



//台灣銀行 004
module.exports.getHistoryResultFromTaiwanBank = getHistoryResultFromTaiwanBank
module.exports.getRealTimeResultFromTaiwanBank = getRealTimeResultFromTaiwanBank

//兆豐商銀 017
module.exports.getRealTimeResultFromMegaBank = getRealTimeResultFromMegaBank

//玉山銀行 808
module.exports.getRealTimeResultFromEsunBank = getRealTimeResultFromEsunBank
//永豐銀行 807
module.exports.getRealTimeResultFromSinopacBank = getRealTimeResultFromSinopacBank

//土地銀行 005
module.exports.getRealTimeResultFromLandBank = getRealTimeResultFromLandBank

//華南銀行 008
module.exports.getRealTimeResultFromHuaNanBank = getRealTimeResultFromHuaNanBank

//彰化銀行 009
module.exports.getRealTimeResultFromChanghuaBank = getRealTimeResultFromChanghuaBank

//富邦銀行 012
module.exports.getRealTimeResultFromFubonBank = getRealTimeResultFromFubonBank

//新光銀行 103
module.exports.getRealTimeResultFromSkBank = getRealTimeResultFromSkBank

//國泰世華 013
module.exports.getRealTimeResultFromCathayBank = getRealTimeResultFromCathayBank


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
