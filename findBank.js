const mongoose = require('mongoose')
const moment = require("moment")
const Bank = require('./model/bank')
const Rate = require('./model/rate')
const {saveMegaBankHistory} = require('./util/util')
const {getBank} = require('./util/util')

if (process.env.NODE_ENV !== 'test') {
    mongoose.Promise = global.Promise
   
   // mongoose.connection.openUri('mongodb://heroku_gsr1gkd1:m8klgb47dr9avug8o6in5g3oo4@ds129946.mlab.com:29946/heroku_gsr1gkd1')
    mongoose.connection.openUri('mongodb://localhost/bank')
    const db = mongoose.connection
    db.on('error', console.error.bind(console, '连接错误:'));
    db.once('open', function() {
        
        // saveMegaBankHistory().then((result) => {
        //     console.log(result.length)
        //     return Rate.find({bankName:'兆豐商銀'})
        // }).then((results) => {
        //     console.log(results.length)
        // })
        
        
        getBank('兆豐商銀', '017').then((result) => {
            console.log(result)
        })
        
        // Bank.findOne({code:'004'})
        //     .populate({
        //         path:'rates',
        //         match: { time: { "$lte": new moment() }},
        //         options: { limit: 10 }
        //     })
        //     .then((bank) => {
        //         console.log(bank)
        //         // const date = bank.rates[0].time
        //         // const dateString = moment(date).format('YYYY/MM/DD')
        //         // console.log(`取出來時間為${dateString}`)
        //     })
        
    })
}
