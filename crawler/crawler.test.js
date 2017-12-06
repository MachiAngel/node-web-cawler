//third part
const expect = require('expect');
const mongoose = require('mongoose')
const moment = require("moment")

const cralwer = require('./crawler')

describe('兆豐銀行API test',() => {
    
    it('會下載兆豐最新20種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromMegaBank()
        expect(resultDict.resultArray.length).toBe(20)
        
    })
    
})



