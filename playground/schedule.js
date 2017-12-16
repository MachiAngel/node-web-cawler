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
        j.cancel()
    }
    console.log('--------開始排程程式碼-----------')
    console.log(new Date())
    lateTime(20000)
        .then((result) => {
            console.log('ha',count)
            console.log(result)
        })
    
    console.log('--------結束排程程式碼-----------')
    count -= 1
}
//每x秒
const j = schedule.scheduleJob('*/1 * * * * *', work)