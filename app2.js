//先載入DB
const {mongoose} = require('./db/mongoose.js')

const schedule = require('node-schedule')
//const {getHistoryRateFromTaiwanBank} = require('./crawler/crawler.js')

//const {saveTaiwankBankHistory} = require('./util/util')
const {refreshTaiwanBankData} = require('./util/util')
const {refreshMegaBankData} = require('./util/util')
const {refreshEsunBankData} = require('./util/util')
const {refreshSinopacBankData} = require('./util/util')
const {refreshLandBankData} = require('./util/util')
const {refreshHuaNanBankData} = require('./util/util')
const {refreshChanghuaBankData} = require('./util/util')
const {refreshFubonBankData} = require('./util/util')
const {refreshSkBankData} = require('./util/util')
const {refreshCathayBankData} = require('./util/util')
const {refreshCitiBankData} = require('./util/util')
const {refreshHSBankData} = require('./util/util')
const {refreshCTBCBankData} = require('./util/util')
const {refreshEntieBankData} = require('./util/util')
const {refreshJihSunBankData} = require('./util/util')
const {refreshTCBankData} = require('./util/util')
const {refreshTaishinBankData} = require('./util/util')
const {refreshDBSBankData} = require('./util/util')
const {refreshKgiBankData} = require('./util/util')


// const rule = new schedule.RecurrenceRule()
// rule.minute = [0,3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60]

schedule.scheduleJob('*/3 * * * *', () => {
    console.log('--------開始排程程式碼-----------')
    console.log(new Date())
    
    //#1 004 台灣銀行
    refreshTaiwanBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    //#2 017 兆豐商銀
    refreshMegaBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    //#3 808 玉山銀行
    refreshEsunBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    //#4 807 永豐銀行
    refreshSinopacBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#5 005 土地銀行
    refreshLandBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#6 008 華南銀行
    refreshHuaNanBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    //#7 009 彰化銀行
    refreshChanghuaBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#8 012 富邦銀行
    refreshFubonBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#9 103 新光銀行
    refreshSkBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#10 013 國泰世華
    refreshCathayBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#11 021 花旗銀行
    refreshCitiBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#12 081 滙豐銀行
    refreshHSBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#13 822 中國信託
    refreshCTBCBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#14 816 安泰銀行
    refreshEntieBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#15 815 日盛銀行
    refreshJihSunBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    //#16 814 大眾銀行
    refreshTCBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    //#17 812 台新銀行
    refreshTaishinBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    //#18 810 星展銀行
    refreshDBSBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    //#19 809 凱基銀行
    refreshKgiBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    console.log('--------執行程式碼結束..等待異步-----------')
})







