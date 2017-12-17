//third part
const expect = require('expect');
const mongoose = require('mongoose')
const moment = require("moment")
const cralwer = require('./crawler')

const check = (arr) => {
    console.log([...new Set(arr)].length == 1 ? true : false)
}

describe.skip('即時匯率API Test',() => {
    
    //#1 台灣銀行
    it('會下載台灣銀行最新匯率19種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromTaiwanBank()
        expect(resultDict.resultArray.length).toBe(19)
    })
    
    //#2 兆豐商銀
    it('會下載兆豐商銀最新匯率20種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromMegaBank()
        expect(resultDict.resultArray.length).toBe(20)
        
    })
    
    //#3 玉山銀行
    it('會下載玉山銀行最新匯率15種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromEsunBank()
        expect(resultDict.resultArray.length).toBe(15)
        // resultDict.resultArray.forEach((value,i) => {
        //     console.log(i)
        //     console.log(value)
        // })
        
    })
    
    //#4 永豐銀行
    it('會下載永豐銀行最新匯率16種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromSinopacBank()
        expect(resultDict.resultArray.length).toBe(16)
    })
    
    
    //#5 土地銀行
    it('會下載土地銀行最新匯率14種幣別資料', async () => {
        const resultDict = await cralwer.getRealTimeResultFromLandBank()
        expect(resultDict.resultArray.length).toBe(14)
        // resultDict.resultArray.forEach((value,i) => {
        //     console.log(i)
        //     console.log(value)
        // })
        
    })
    
    //#6 華南銀行
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
    
    //#7 彰化銀行
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
    
    //#8 富邦銀行
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
    
    //#9 新光銀行
    it('會下載新光銀行最新匯率16種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromSkBank()
        expect(resultDict.resultArray.length).toBe(16)
        
        //即期現金 幣別資料應該要有10個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return result.cashBuying == 0
        })
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(10)
        
    })
    
    //#10 國泰世華
    it('會下載國泰世華銀行最新匯率17種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromCathayBank()
        expect(resultDict.resultArray.length).toBe(16)
        
        //提供即期現金 幣別資料應該要有5個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return result.cashBuying !== 0
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(5)
        
    })
    
    //#11 花旗銀行
    it('會下載花旗銀行最新匯率14種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromCitiBank()
        expect(resultDict.resultArray.length).toBe(14)
        
        //提供即期現金 幣別資料應該要有4個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return result.cashBuying !== 0
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(5)
    })
    
    //#12 滙豐銀行
    it('會下載滙豐銀行最新匯率13種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromHSBank()
        expect(resultDict.resultArray.length).toBe(13)
        
        //提供即期現金 幣別資料應該要有4個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return result.cashBuying !== 0
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(7)
    })
    
    //#13 中國信託
    it('會下載中國信託最新匯率20種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromCTBCBank()
        expect(resultDict.resultArray.length).toBe(20)
        
        //提供現金買賣 幣別資料應該要有5個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return (result.cashBuying !== 0 && result.cashBuying !== 0)
        })

        expect(filtedArrayOfHaveNotCashTrade.length).toBe(5)
    })
    
    //#14 安泰銀行
    it('會下載安泰銀行最新匯率13種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromEntieBank()
        expect(resultDict.resultArray.length).toBe(13)
        
        //提供現金買賣 幣別資料應該要有5個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return (result.cashBuying !== 0 && result.cashBuying !== 0)
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(5)
    })
    
    //#15 日盛銀行
    it('會下載日盛銀行最新匯率13種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromjihSunBank()
        expect(resultDict.resultArray.length).toBe(13)
        
        //提供現金買賣 幣別資料應該要有5個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return (result.cashBuying !== 0 && result.cashBuying !== 0)
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(5)
    })
    
    //#16 大眾銀行
    it('會下載大眾銀行最新匯率15種幣別資料(不抓美國國際快滙)', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromTCBank()
        expect(resultDict.resultArray.length).toBe(15)
        
        //提供現金買賣 幣別資料應該要有5個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return (result.cashBuying !== 0 && result.cashBuying !== 0)
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(5)
    })
    
    //#17 台新銀行
    it('會下載台新銀行最新匯率14種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromTaishinBank()
        expect(resultDict.resultArray.length).toBe(14)
        
        //提供現金買賣 幣別資料應該要有5個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return (result.cashBuying !== 0 && result.cashBuying !== 0)
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(9)
    })
    
    //#18 星展銀行
    it('會下載星展銀行最新匯率13種幣別資料', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromDBSBank()
        expect(resultDict.resultArray.length).toBe(13)
        
        //提供現金買賣 幣別資料應該要有6個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return (result.cashBuying !== 0 && result.cashBuying !== 0)
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(6)
    })
    
    //#19 星展銀行!!
    it('會下載星展銀行最新匯率14種幣別資料 , 不包含USD MG速匯金', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromKgiBank()
        expect(resultDict.resultArray.length).toBe(14)
        
        //提供現金買賣 幣別資料應該要有5個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return (result.cashBuying !== 0 && result.cashBuying !== 0)
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(5)
    })
    
    //#20 元大銀行!!
    it('會下載元大銀行最新匯率14種幣別資料 , 不包含USD 西聯匯金', async () => {
        
        const resultDict = await cralwer.getRealTimeResultFromYuantaBank()
        expect(resultDict.resultArray.length).toBe(14)
        
        //提供現金買賣 幣別資料應該要有5個
        const filtedArrayOfHaveNotCashTrade = resultDict.resultArray.filter((result) => {
            return (result.cashBuying !== 0 && result.cashBuying !== 0)
        })
        
        expect(filtedArrayOfHaveNotCashTrade.length).toBe(5)
    })
    
})



