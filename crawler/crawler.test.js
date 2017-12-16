//third part
const expect = require('expect');
const mongoose = require('mongoose')
const moment = require("moment")

const cralwer = require('./crawler')

const check = (arr) => {
    console.log([...new Set(arr)].length == 1 ? true : false)
}

describe.skip('即時匯率API Test',() => {
    
    it('會下載台灣銀行最新匯率19種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromTaiwanBank()
        expect(resultDict.resultArray.length).toBe(19)
    })
    
    it('會下載兆豐商銀最新匯率20種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromMegaBank()
        expect(resultDict.resultArray.length).toBe(20)
        
    })
    
    it('會下載玉山銀行最新匯率15種幣別資料', async () => {
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
    
    
    it('會下載土地銀行最新匯率14種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromLandBank()
        expect(resultDict.resultArray.length).toBe(14)
        // resultDict.resultArray.forEach((value,i) => {
        //     console.log(i)
        //     console.log(value)
        // })
        
    })
    
    it('會下載華南銀行最新匯率15種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromHuaNanBank()
        expect(resultDict.resultArray.length).toBe(15)
        
        //即期現金 幣別資料應該要有9個
        const filtedArrayOfHaveCashTrade = resultDict.resultArray.filter((result) => {
            return result.cashBuying != 0
        })
        expect(filtedArrayOfHaveCashTrade.length).toBe(9)
    
        //即期存摺 幣別資料應該要有14個
        const filtedArrayOfHaveSpotTrade = resultDict.resultArray.filter((result) => {
            return result.spotBuying != 0
        })
        expect(filtedArrayOfHaveSpotTrade.length).toBe(14)
    })
    
    it('會下載彰化銀行最新匯率14種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromChanghuaBank()
        expect(resultDict.resultArray.length).toBe(14)
        
        //即期現金 幣別資料應該要有5個
        const filtedArrayOfHaveCashTrade = resultDict.resultArray.filter((result) => {
            return result.cashBuying != 0
        })
        expect(filtedArrayOfHaveCashTrade.length).toBe(5)
        
        //即期存摺 幣別資料應該要有14個
        const filtedArrayOfHaveSpotTrade = resultDict.resultArray.filter((result) => {
            return result.spotBuying != 0
        })
        expect(filtedArrayOfHaveSpotTrade.length).toBe(14)
    })
    
    it('會下載富邦銀行最新匯率14種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromFubonBank()
        expect(resultDict.resultArray.length).toBe(14)
        
        //即期現金 幣別資料應該要有5個
        const filtedArrayOfHaveCashTrade = resultDict.resultArray.filter((result) => {
            return result.cashBuying != 0
        })
        expect(filtedArrayOfHaveCashTrade.length).toBe(5)
        
        //即期存摺 幣別資料應該要有14個
        const filtedArrayOfHaveSpotTrade = resultDict.resultArray.filter((result) => {
            return result.spotBuying != 0
        })
        expect(filtedArrayOfHaveSpotTrade.length).toBe(14)
    })
    
    it('會下載新光銀行最新匯率16種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromSkBank()
        expect(resultDict.resultArray.length).toBe(16)
        
        //即期現金 幣別資料應該要有10個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return result.cashBuying == 0
        })
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(10)
        
    })
    
    it('會下載國泰世華銀行最新匯率17種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromCathayBank()
        expect(resultDict.resultArray.length).toBe(16)
        
        //提供即期現金 幣別資料應該要有5個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return result.cashBuying !== 0
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(5)
        
    })
    
    
})



