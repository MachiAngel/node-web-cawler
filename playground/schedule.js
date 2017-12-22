const schedule = require('node-schedule')

// const rule = new schedule.RecurrenceRule()
// rule.second = [0,10,20,30,40,50]
//
// schedule.scheduleJob(rule, function(){
//     console.log('開始任務')
// })

const lateTime = async (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('hi')
        },time)
    })
    
}

var count = 10
const work = () => {
    if (count <= 0) {
        console.log('cancel')
        j.cancel()
    }
    if (count <= 5) {
        count -= 1
        return
    }
    console.log(count)
    count -= 1
}
//每x秒
const j = schedule.scheduleJob('*/1 * * * * *', work)