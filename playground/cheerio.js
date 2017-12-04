const moment = require("moment")


// const cheerio = require('cheerio')
//
// const $ = cheerio.load('<ul id="fruits">\n' +
//     '  <li class="rate-content-cash text-right print_table-cell">Apple</li>\n' +
//     '  <li class="orange">Orange</li>\n' +
//     '  <li class="pear">Pear</li>\n' +
//     '</ul>')
//
//
// console.log($('.rate-content-cash,.text-right,.print_table-cell').text())


const dateString = '2017/11/24'

const dateObj1 = moment(dateString,'YYYY/MM/DD')
const dateObj2 = moment(dateString,'YYYY/MM/DD')

if (dateObj1.isSame(dateObj2)) {
    console.log('true')
}else {
    console.log('false')
}

//
// if(dateObj1.format('YYYY/MM/DD') === dateObj2.format('YYYY/MM/DD')) {
//     console.log(dateObj1.valueOf())
//     console.log(dateObj1)
//     console.log(dateObj2)
//     console.log('時間一樣')
// }else {
//     console.log('時間不一樣')
// }
//
// //
// console.log(dateObj1.format('YYYY/MM/DD'))
// const nowObj = moment()
// console.log(nowObj.format('YYYY/MM/DD'))



// function checkStringIsNumberAndConvertToNumber(str) {
//     return /^\d+\.?\d*$/.test(str) ? Number(str) : 0;
// }
//
// const strNumber = '12安345'
//
// console.log(checkStringIsNumberAndConvertToNumber(strNumber))


// const array = [1,2,3,4,5,undefined,7,8,9,10]
//
// const dict = {}
// dict['cashBuying'] = 0
// dict['cashSelling'] = 0
// dict['spotBuying'] = 0
// dict['spotSelling'] = 0
//
// if (dict['cashBuying'] === 0 &&
//     dict['cashSelling'] === 0 &&
//     dict['spotBuying'] === 0 &&
//     dict['spotSelling'] === 0) {
//     console.log('not save')
// }else {
//     console.log('save')
// }

