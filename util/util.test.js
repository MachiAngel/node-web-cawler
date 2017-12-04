
const {convertStringToNumberFunction} = require('./publicfuction')
const publicFuction = require('./publicfuction')

//測試function
const a = convertStringToNumberFunction('12345678')
console.log(a)

const b = publicFuction.convertStringToNumberFunction('12345678a')
console.log(b)

