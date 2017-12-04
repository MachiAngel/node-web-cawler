const mongoose = require('mongoose')
const moment = require("moment")
const Bank = require('./model/bank')
const Rate = require('./model/rate')

if (process.env.NODE_ENV !== 'test') {
    mongoose.Promise = global.Promise
    mongoose.connection.openUri('mongodb://localhost/bank')
    const db = mongoose.connection
    db.on('error', console.error.bind(console, '连接错误:'));
    db.once('open', function() {
    
        Bank.findOne({code:'004'})
            .populate({
                path:'rates',
                match: { time: { "$lte": new moment() }},
                options: { limit: 1 }
            })
            .then((bank) => {
                console.log(bank)
                const date = bank.rates[0].time
                const dateString = moment(date).format('YYYY/MM/DD')
                console.log(`取出來時間為${dateString}`)
            })
        
    })
}
