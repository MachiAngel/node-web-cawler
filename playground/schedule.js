const schedule = require('node-schedule')

const rule = new schedule.RecurrenceRule()
rule.second = [0,10,20,30,40,50]

schedule.scheduleJob(rule, function(){
    console.log('開始任務')
})

