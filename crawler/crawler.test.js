//third part
const expect = require('expect');
const mongoose = require('mongoose')
const moment = require("moment")

const cralwer = require('./crawler')

const check = (arr) => {
    console.log([...new Set(arr)].length == 1 ? true : false)
}

describe('即時匯率API Test',() => {
    
    it('會下載台灣銀行最新匯率19種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromTaiwanBank()
        expect(resultDict.resultArray.length).toBe(19)
    })
    
    it('會下載兆豐商銀最新匯率20種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromMegaBank()
        expect(resultDict.resultArray.length).toBe(20)
        
    })
    
    it.only('會下載玉山銀行最新匯率15種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromEsunBank()
        expect(resultDict.resultArray.length).toBe(15)
        // resultDict.resultArray.forEach((value,i) => {
        //     console.log(i)
        //     console.log(value)
        // })
        
    })
    
    it('會下載永豐銀行最新匯率16種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromSinopacBank()
        expect(resultDict.resultArray.length).toBe(16)
    })
    
})



