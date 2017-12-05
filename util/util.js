// const cheerio = require('cheerio')
// const request = require('request')

//model
const moment = require('moment')
const Bank = require('../model/bank.js')
const Rate = require('../model/rate.js')

//util
const SupportCurrency = require('../util/supportCurrency')
const cralwer = require('../crawler/crawler')


//設計為一定有bank回傳 沒有的話就創一個 並回傳
const getBank = async (bankName,bankCode) => {
    try {
        const bank = await Bank.findOne({code:bankCode})
        if(bank){
            return bank
        }else{
            const bank = new Bank({name:bankName,code:bankCode})
            const savedBank = await bank.save()
            if (savedBank) {
                return savedBank
            }else{
                throw new Error()
            }
            
        }
    }catch (e) {
        throw new Error('can not find or create bank')
    }
}

const getLatestRate = async (bankCode,currencyName) => {
    
    const latesetRate = await Rate.findOne({
        bankCode,
        currencyName
        })
        .sort({ time: -1 })
    
    if(latesetRate) {
        console.log(`get lastest ${currencyName} rate of ${latesetRate.bankName} success`)
        const timeString = moment(latesetRate.time).format('YYYY/MM/DD')
        console.log(timeString)
        console.log(latesetRate)
        return latesetRate
    }else {
        console.log(`get lastest ${currencyName} rate of bankcode = ${bankCode} fail`)
        return undefined
    }
    
}

//台灣銀行拿取資料 回傳 promise success
const refreshTaiwanBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromTaiwanBank()
    if(resultDict === undefined) {
        throw new Error('realtime taiwan bank data undefined')
    }
    //更新即時資料
    const taiwanBank = await Bank.findOneAndUpdate(
        {code:'004'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(taiwanBank) {
        console.log('更新004即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log('有找到004歷史資料 不用存~')
        }else {
            console.log('沒找到 存進去吧')
            const latestRate = new Rate(newRate)
            latestRate.bank = taiwanBank
            taiwanBank.rates.push(latestRate)
            const savedTaiwanBank = await taiwanBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedTaiwanBank) {
                console.log('更新004歷史資料成功')
            }else{
                console.log('沒有004資料存入時也失敗')
            }
        }
    }
    
    return 'refresh 004 success'
    
    
}


const saveTaiwankBankHistory = async () => {
    const currencyArray = SupportCurrency.currencyArrayOf004
    const taiwanBank = await getBank('台灣銀行','004')
    
    for (let curreny of currencyArray) {
        //爬取結果
        const resultArray = await cralwer.getHistoryResultFromTaiwanBank(curreny)
        
        //要是有台灣銀行(一定要有), 存入結果關連
        if (taiwanBank) {
            for (let rate of resultArray) {
                const rateModel = new Rate(rate)
                rateModel.bank = taiwanBank
                taiwanBank.rates.push(rateModel)
                await taiwanBank.save()
                await rateModel.save()
            }
        }else {
            console.log('沒有找到台灣銀行')
        }
    }
}


module.exports = {
    getBank,
    getLatestRate,
    saveTaiwankBankHistory,
    refreshTaiwanBankData
}
