
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

//017 兆豐商銀
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
//021 花旗銀行
const refreshCitiBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromCitiBank()
    if(resultDict === undefined) {
        throw new Error('realtime Citi bank data undefined')
    }
    //更新即時資料
    const citiBank = await Bank.findOneAndUpdate(
        {code:'021'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(citiBank) {
        console.log('更新花旗銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到花旗銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = citiBank
            citiBank.rates.push(latestRate)
            const savedCitiBank = await citiBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedCitiBank) {
                console.log('更新花旗銀行-歷史資料成功')
            }else{
                console.log('沒有花旗銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 021 done'
}
//081 滙豐銀行
const refreshHSBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromHSBank()
    if(resultDict === undefined) {
        throw new Error('realtime HS bank data undefined')
    }
    //更新即時資料
    const hsBank = await Bank.findOneAndUpdate(
        {code:'081'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(hsBank) {
        console.log('更新花旗銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到滙豐銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = hsBank
            hsBank.rates.push(latestRate)
            const savedHsBank = await hsBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedHsBank) {
                console.log('更新滙豐銀行-歷史資料成功')
            }else{
                console.log('沒有滙豐銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 081 done'
}
//822 中國信託
const refreshCTBCBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromCTBCBank()
    if(resultDict === undefined) {
        throw new Error('realtime CTBC bank data undefined')
    }
    //更新即時資料
    const ctbcBank = await Bank.findOneAndUpdate(
        {code:'822'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(ctbcBank) {
        console.log('更新中國信託-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到中國信託的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = ctbcBank
            ctbcBank.rates.push(latestRate)
            const savedCTBCBank = await ctbcBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedCTBCBank) {
                console.log('更新中國信託-歷史資料成功')
            }else{
                console.log('沒有中國信託資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 822 done'
}
//816 安泰銀行
const refreshEntieBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromEntieBank()
    if(resultDict === undefined) {
        throw new Error('realtime Entie bank data undefined')
    }
    //更新即時資料
    const entieBank = await Bank.findOneAndUpdate(
        {code:'816'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(entieBank) {
        console.log('更新安泰銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到安泰銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = entieBank
            entieBank.rates.push(latestRate)
            const savedEntieBank = await entieBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedEntieBank) {
                console.log('更新安泰銀行-歷史資料成功')
            }else{
                console.log('沒有安泰銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 816 done'
}
//815 日盛銀行
const refreshJihSunBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromjihSunBank()
    if(resultDict === undefined) {
        throw new Error('realtime JihSun bank data undefined')
    }
    //更新即時資料
    const jihSunBank = await Bank.findOneAndUpdate(
        {code:'815'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(jihSunBank) {
        console.log('更新日盛銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到日盛銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = jihSunBank
            jihSunBank.rates.push(latestRate)
            const savedJihSunBankBank = await jihSunBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedJihSunBankBank) {
                console.log('更新日盛銀行-歷史資料成功')
            }else{
                console.log('沒有日盛銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 815 done'
}
//814 大眾銀行
const refreshTCBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromTCBank()
    if(resultDict === undefined) {
        throw new Error('realtime TC bank data undefined')
    }
    //更新即時資料
    const tcBank = await Bank.findOneAndUpdate(
        {code:'814'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(tcBank) {
        console.log('更新大眾銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到大眾銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = tcBank
            tcBank.rates.push(latestRate)
            const savedTCBankBank = await tcBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedTCBankBank) {
                console.log('更新大眾銀行-歷史資料成功')
            }else{
                console.log('沒有大眾銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 814 done'
}
//812 台新銀行
const refreshTaishinBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromTaishinBank()
    if(resultDict === undefined) {
        throw new Error('realtime Taishin bank data undefined')
    }
    //更新即時資料
    const taishinBank = await Bank.findOneAndUpdate(
        {code:'812'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(taishinBank) {
        console.log('更新台新銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到台新銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = taishinBank
            taishinBank.rates.push(latestRate)
            const savedTaishinBankBank = await taishinBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedTaishinBankBank) {
                console.log('更新台新銀行-歷史資料成功')
            }else{
                console.log('沒有台新銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 812 done'
}
//810 星展銀行
const refreshDBSBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromDBSBank()
    if(resultDict === undefined) {
        throw new Error('realtime DBS bank data undefined')
    }
    //更新即時資料
    const dBSBank = await Bank.findOneAndUpdate(
        {code:'810'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(dBSBank) {
        console.log('更新星展銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到星展銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = dBSBank
            dBSBank.rates.push(latestRate)
            const savedDBSBank = await dBSBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedDBSBank) {
                console.log('更新星展銀行-歷史資料成功')
            }else{
                console.log('沒有星展銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 810 done'
}
//809 凱基銀行
const refreshKgiBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromKgiBank()
    if(resultDict === undefined) {
        throw new Error('realtime Kgi bank data undefined')
    }
    //更新即時資料
    const kgiBank = await Bank.findOneAndUpdate(
        {code:'809'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(kgiBank) {
        console.log('更新凱基銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到凱基銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = kgiBank
            kgiBank.rates.push(latestRate)
            const savedKgiBank = await kgiBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedKgiBank) {
                console.log('更新凱基銀行-歷史資料成功')
            }else{
                console.log('沒有凱基銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 809 done'
}
//806 元大銀行
const refreshYuanTaBankData = async () => {
    const resultDict = await cralwer.getRealTimeResultFromYuantaBank()
    if(resultDict === undefined) {
        throw new Error('元大即時資料 undefined')
    }
    //更新即時資料
    const yuantaBank = await Bank.findOneAndUpdate(
        {code:'806'},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(yuantaBank) {
        console.log('更新元大銀行-即時匯率成功')
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到元大銀行的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = yuantaBank
            yuantaBank.rates.push(latestRate)
            const savedYuantaBank = await yuantaBank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedYuantaBank) {
                console.log('更新元大銀行-歷史資料成功')
            }else{
                console.log('沒有元大銀行資料歷史資料-存入時也失敗')
            }
        }
    }
    return 'refresh 806 done'
}


//公用function
const refreshBankDataFor = async (bankCode) => {
    
    const bankInfo = bankInfoDict[bankCode]
    if (bankInfo === undefined) {
        throw new Error(`沒有${bankCode}的bankInfo資料`)
    }
    const resultDict = await bankInfo.bankCawler()
    if(resultDict === undefined) {
        throw new Error(`${bankInfo.bankName}即時資料 undefined`)
    }
    //更新即時資料
    const bank = await Bank.findOneAndUpdate(
        {code:bankInfo.bankCode},
        {latestRates:resultDict.resultArray,currencyUpdateTime:resultDict.resultTime},
        {new: true})
    
    if(bank) {
        console.log(`更新${bankInfo.bankName}-即時匯率成功`)
    }
    //將每個幣別關連後存到歷史db
    for (let newRate of resultDict.resultArray) {
        const findResultRate = await Rate.findOne(newRate)
        if (findResultRate) {
            console.log(`有找到${bankInfo.bankName}的${findResultRate.currencyName}歷史資料 不用存`)
        }else {
            const latestRate = new Rate(newRate)
            latestRate.bank = bank
            bank.rates.push(latestRate)
            const savedBank = await bank.save()
            const savedRate = await latestRate.save()
            // const savedRate = await Rate.create(newRate)
            if (savedRate && savedBank) {
                console.log(`新增${bankInfo.bankName}的(${savedRate.currencyName})歷史資料成功,匯率時間:${savedRate.time}`)
            }else{
                console.log(`沒有${bankInfo.bankName}資料歷史資料-存入時也失敗`)
            }
        }
    }
    return `更新 ${bankInfo.bankCode} ${bankInfo.bankName} 完成`
}



const bankInfoDict = {
    '004':{
        bankName:'台灣銀行',
        bankCode:'004',
        bankCawler:cralwer.getRealTimeResultFromTaiwanBank
    },
    '017':{
        bankName:'兆豐商銀',
        bankCode:'017',
        bankCawler:cralwer.getRealTimeResultFromMegaBank
    },
    '808':{
        bankName:'玉山銀行',
        bankCode:'808',
        bankCawler:cralwer.getRealTimeResultFromEsunBank
    },
    '807':{
        bankName:'永豐銀行',
        bankCode:'807',
        bankCawler:cralwer.getRealTimeResultFromSinopacBank
    },
    '005':{
        bankName:'土地銀行',
        bankCode:'005',
        bankCawler:cralwer.getRealTimeResultFromLandBank
    },
    '008':{
        bankName:'華南銀行',
        bankCode:'008',
        bankCawler:cralwer.getRealTimeResultFromHuaNanBank
    },
    '009':{
        bankName:'彰化銀行',
        bankCode:'009',
        bankCawler:cralwer.getRealTimeResultFromChanghuaBank
    },
    '012':{
        bankName:'富邦銀行',
        bankCode:'012',
        bankCawler:cralwer.getRealTimeResultFromFubonBank
    },
    '103':{
        bankName:'新光銀行',
        bankCode:'103',
        bankCawler:cralwer.getRealTimeResultFromSkBank
    },
    '013':{
        bankName:'國泰世華',
        bankCode:'103',
        bankCawler:cralwer.getRealTimeResultFromCathayBank
    },
    '021':{
        bankName:'花旗銀行',
        bankCode:'021',
        bankCawler:cralwer.getRealTimeResultFromCitiBank
    },
    '081':{
        bankName:'滙豐銀行',
        bankCode:'081',
        bankCawler:cralwer.getRealTimeResultFromHSBank
    },
    '822':{
        bankName:'中國信託',
        bankCode:'822',
        bankCawler:cralwer.getRealTimeResultFromCTBCBank
    },
    '816':{
        bankName:'安泰銀行',
        bankCode:'816',
        bankCawler:cralwer.getRealTimeResultFromEntieBank
    },
    '815':{
        bankName:'日盛銀行',
        bankCode:'815',
        bankCawler:cralwer.getRealTimeResultFromjihSunBank
    },
    '814':{
        bankName:'大眾銀行',
        bankCode:'814',
        bankCawler:cralwer.getRealTimeResultFromTCBank
    },
    '812':{
        bankName:'台新銀行',
        bankCode:'812',
        bankCawler:cralwer.getRealTimeResultFromTaishinBank
    },
    '810':{
        bankName:'星展銀行',
        bankCode:'810',
        bankCawler:cralwer.getRealTimeResultFromDBSBank
    },
    '809':{
        bankName:'凱基銀行',
        bankCode:'809',
        bankCawler:cralwer.getRealTimeResultFromKgiBank
    },
    '806':{
        bankName:'元大銀行',
        bankCode:'806',
        bankCawler:cralwer.getRealTimeResultFromYuantaBank
    },
    '805':{
        bankName:'遠東銀行',
        bankCode:'805',
        bankCawler:cralwer.getRealTimeResultFromFarEastBank
    },
    '803':{
        bankName:'聯邦銀行',
        bankCode:'803',
        bankCawler:cralwer.getRealTimeResultFromUBOTBank
    },
    '147':{
        bankName:'三信銀行',
        bankCode:'147',
        bankCawler:cralwer.getRealTimeResultFromCotaBank
    },
    '118':{
        bankName:'板信銀行',
        bankCode:'118',
        bankCawler:cralwer.getRealTimeResultFromBOPBank
    },
    '108':{
        bankName:'陽信銀行',
        bankCode:'108',
        bankCawler:cralwer.getRealTimeResultFromSunnyBank
    },
    '053':{
        bankName:'台中銀行',
        bankCode:'053',
        bankCawler:cralwer.getRealTimeResultFromTaichungBank
    },
    '050':{
        bankName:'台灣企銀',
        bankCode:'050',
        bankCawler:cralwer.getRealTimeResultFromTbbBank
    },
    '016':{
        bankName:'高雄銀行',
        bankCode:'016',
        bankCawler:cralwer.getRealTimeResultFromKaoHsiungBank
    },
    '052':{
        bankName:'渣打銀行',
        bankCode:'052',
        bankCawler:cralwer.getRealTimeResultFromCharterBank
    },
    '007':{
        bankName:'第一銀行',
        bankCode:'007',
        bankCawler:cralwer.getRealTimeResultFromFirstBank
    },
    '006':{
        bankName:'合作金庫',
        bankCode:'006',
        bankCawler:cralwer.getRealTimeResultFromCooperativeBank
    }
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
    refreshCathayBankData,
    refreshCitiBankData,
    refreshHSBankData,
    refreshCTBCBankData,
    refreshEntieBankData,
    refreshJihSunBankData,
    refreshTCBankData,
    refreshTaishinBankData,
    refreshDBSBankData,
    refreshKgiBankData,
    refreshYuanTaBankData,
    refreshBankDataFor
}
