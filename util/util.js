// const cheerio = require('cheerio')
// const request = require('request')
const path = require('path')
//model
const moment = require('moment')
const Bank = require('../model/bank.js')
const Rate = require('../model/rate.js')

//util
const SupportCurrency = require('../util/supportCurrency')
const cralwer = require('../crawler/crawler')
const xlsx = require('node-xlsx')

//公有方法->設計為一定有bank回傳 沒有的話就創一個 並回傳
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

//004 台灣銀行拿取資料 回傳 promise success
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
            console.log(`有找到017銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
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
    
    return 'refresh 004 done'
    
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

//017
const parseMegaBankHistoryExcel = (currencyName) => {
    try{
        const absolutePath = path.dirname(__filename)
        const workSheetsFromFile = xlsx.parse(`${absolutePath}/../playground/rate_excel/ph23d_${currencyName}_LST.XLS`)
        const originArray = workSheetsFromFile[0].data
        originArray.splice(0,3)
        const formatedArray = originArray.map((each) => {
            const dict = {}
            dict['bankName'] = '兆豐商銀'
            dict['bankCode'] = '017'
            dict['currencyName'] = currencyName
            const timeString = each[0].trim()
            const dateObj = moment(timeString, 'YYYY/MM/DD')
            dict['time'] = dateObj
            dict['spotBuying'] = each[1].trim()
            dict['cashBuying'] = each[2].trim()
            dict['spotSelling'] = each[3].trim()
            dict['cashSelling'] = each[4].trim()
            
            return dict
        })
        return formatedArray
        
    }catch (e) {
        console.log(e.message)
    }
}
const saveMegaBankHistory = async () => {
    
    var totalArray = []
    SupportCurrency.currencyArrayOf017.forEach((currencyName) => {
        const resultArray = parseMegaBankHistoryExcel(currencyName)
        totalArray = totalArray.concat(resultArray)
        console.log(totalArray.length)
    })
    const megaBank = await getBank('兆豐商銀', '017')
    for (let rate of totalArray) {
        console.log(rate)
        const rateModel = new Rate(rate)
        rateModel.bank = megaBank
        megaBank.rates.push(rateModel)
        await megaBank.save()
        await rateModel.save()
    }
    return 'done'
}
const refreshMegaBankData = async () => {
    
    const resultDict = await cralwer.getRealTimeResultFromMegaBank()
    if(resultDict === undefined) {
        throw new Error('realtime mega bank data undefined')
    }
    //更新即時資料
    const megaBank = await Bank.findOneAndUpdate(
        {code:'017'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(megaBank) {
        console.log('更新017即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到017銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = megaBank
            megaBank.rates.push(latestRate)
            const savedMegaBank = await megaBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedMegaBank) {
                console.log('更新017歷史資料成功')
            }else{
                console.log('沒有017資料存入時也失敗')
            }
        }
    }
    return 'refresh 017 done'
}

//808 玉山銀行
const refreshEsunBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromEsunBank()
    if(resultDict === undefined) {
        throw new Error('realtime Esun bank data undefined')
    }
    //更新即時資料
    const esunBank = await Bank.findOneAndUpdate(
        {code:'808'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(esunBank) {
        console.log('更新玉山銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到玉山銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = esunBank
            esunBank.rates.push(latestRate)
            const savedEsunBank = await esunBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedEsunBank) {
                console.log('更新玉山銀行-歷史資料成功')
            }else{
                console.log('沒有玉山銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    
    return 'refresh 808 done'
    
}


//807 永豐銀行
const refreshSinopacBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromSinopacBank()
    if(resultDict === undefined) {
        throw new Error('realtime Esun bank data undefined')
    }
    //更新即時資料
    const sinopacBank = await Bank.findOneAndUpdate(
        {code:'807'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(sinopacBank) {
        console.log('更新永豐銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到永豐銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = sinopacBank
            sinopacBank.rates.push(latestRate)
            const savedSinopacBank = await sinopacBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedSinopacBank) {
                console.log('更新永豐銀行-歷史資料成功')
            }else{
                console.log('沒有永豐銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 807 done'
}


//005 土地銀行
const refreshLandBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromLandBank()
    if(resultDict === undefined) {
        throw new Error('realtime land bank data undefined')
    }
    //更新即時資料
    const landBank = await Bank.findOneAndUpdate(
        {code:'005'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(landBank) {
        console.log('更新永豐銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到土地銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = landBank
            landBank.rates.push(latestRate)
            const savedLandBank = await landBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedLandBank) {
                console.log('更新土地銀行-歷史資料成功')
            }else{
                console.log('沒有土地銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 土地銀行 done'
}



//008 華南銀行
const refreshHuaNanBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromHuaNanBank()
    if(resultDict === undefined) {
        throw new Error('realtime HuaNan bank data undefined')
    }
    //更新即時資料
    const huananBank = await Bank.findOneAndUpdate(
        {code:'008'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(huananBank) {
        console.log('更新華南銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到華南銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = huananBank
            huananBank.rates.push(latestRate)
            const savedHuananBank = await huananBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedHuananBank) {
                console.log('更新華南銀行-歷史資料成功')
            }else{
                console.log('沒有華南銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 008 done'
}

//009 彰化銀行
const refreshChanghuaBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromChanghuaBank()
    if(resultDict === undefined) {
        throw new Error('realtime HuaNan bank data undefined')
    }
    //更新即時資料
    const changhuaBank = await Bank.findOneAndUpdate(
        {code:'009'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(changhuaBank) {
        console.log('更新彰化銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到彰化銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = changhuaBank
            changhuaBank.rates.push(latestRate)
            const savedChanghuaBank = await changhuaBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedChanghuaBank) {
                console.log('更新彰化銀行-歷史資料成功')
            }else{
                console.log('沒有彰化銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 009 done'
}

//012 富邦銀行
const refreshFubonBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromFubonBank()
    if(resultDict === undefined) {
        throw new Error('realtime Fubon bank data undefined')
    }
    //更新即時資料
    const fubonBank = await Bank.findOneAndUpdate(
        {code:'012'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(fubonBank) {
        console.log('更新富邦銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到富邦銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = fubonBank
            fubonBank.rates.push(latestRate)
            const savedFubonBank = await fubonBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedFubonBank) {
                console.log('更新富邦銀行-歷史資料成功')
            }else{
                console.log('沒有富邦銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 012 done'
}

//103 新光銀行
const refreshSkBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromSkBank()
    if(resultDict === undefined) {
        throw new Error('realtime Sk bank data undefined')
    }
    //更新即時資料
    const skBank = await Bank.findOneAndUpdate(
        {code:'103'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(skBank) {
        console.log('更新新光銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到新光銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = skBank
            skBank.rates.push(latestRate)
            const savedSkBank = await skBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedSkBank) {
                console.log('更新新光銀行-歷史資料成功')
            }else{
                console.log('沒有新光銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 103 done'
}

//013 國泰世華
const refreshCathayBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromCathayBank()
    if(resultDict === undefined) {
        throw new Error('realtime Cathay bank data undefined')
    }
    //更新即時資料
    const cathayBank = await Bank.findOneAndUpdate(
        {code:'013'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(cathayBank) {
        console.log('更新國泰世華-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到國泰世華的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = cathayBank
            cathayBank.rates.push(latestRate)
            const savedCathayBank = await cathayBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedCathayBank) {
                console.log('更新國泰世華銀行-歷史資料成功')
            }else{
                console.log('沒有國泰世華銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 013 done'
}



module.exports = {
    getBank,
    getLatestRate,
    saveTaiwankBankHistory,
    refreshTaiwanBankData,
    saveMegaBankHistory,
    refreshMegaBankData,
    refreshEsunBankData,
    refreshSinopacBankData,
    refreshLandBankData,
    refreshHuaNanBankData,
    refreshChanghuaBankData,
    refreshFubonBankData,
    refreshSkBankData,
    refreshCathayBankData
}
