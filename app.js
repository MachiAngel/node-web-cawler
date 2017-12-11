//先載入DB
const {mongoose} = require('./db/mongoose.js')

const schedule = require('node-schedule')
//const {getHistoryRateFromTaiwanBank} = require('./crawler/crawler.js')

//const {saveTaiwankBankHistory} = require('./util/util')
const {refreshTaiwanBankData} = require('./util/util')
const {refreshMegaBankData} = require('./util/util')

// const rule = new schedule.RecurrenceRule()
// rule.minute = [0,3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60]

schedule.scheduleJob('*/3 * * * *', () => {
    console.log('--------開始排程程式碼-----------')
    console.log(new Date())
    
    //004
    refreshTaiwanBankData()
        .then((result) => {
        console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    //017
    refreshMegaBankData()
        .then((result) => {
        console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    //808
    refreshEsunBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    //807
    refreshSinopacBankData()
        .then((result) => {
            console.log(result)
        }).catch((e) => {
        console.log(e)
    })
    
    console.log('--------執行程式碼結束..等待異步-----------')
})







