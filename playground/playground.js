const moment = require("moment")
const tz = require("moment-timezone")


// const now1 = moment('2017/12/19 00:13','YYYY/MM/DD h:mm')

const shouldReflesh = () => {
    const nowMoment = moment()
    const nowHour = nowMoment.tz('Asia/Taipei').format('H')
    // var re = /(^[0-9]([.][0-9]{1,2})?$)|(^1[0-9]([.][0-9]{1,2})?$)|(^2[0-3]([.][0-9]{1,2})?$)|(^24([.]0{1,2})?$)/;
    
    
    if (nowHour > 7 && nowHour < 21) {
        return true
    }else {
        return false
    }
}

const should = shouldReflesh()
console.log(should)




// console.log(now1)
// console.log(a)
// console.log(typeof a)

// const a = '24.1'
//
// console.log(re.test(a))

// function handlePosts() {
//     var posts = [
//       { id: 23, title: 'Daily JS News' },
//       { id: 52, title: 'Code Refactor City' },
//       { id: 105, title: 'The Brightest Ruby' }
//     ];
//
//     posts.forEach((post) => savePost(post))
// }
//
//
// const savePost = (post) => {
//     console.log(`saved ${post.title}`)
// }

// function savePost(post) {
//     console.log(`saved ${post.title}`)
// }

// handlePosts()


// const goFunction = async () => {
//     await getError()
//         .catch(translateError('errrrr'))
//     return value
// }
//
// const getError = async () => {
//     const a = 1
//     if (a === 1) {
//         throw new Error('this is new error')
//     }else {
//         return 1
//     }
// }
//
// function translateError(msg) {
//     var newErr = new Error(msg); // placed here to get correct stack
//     return e => {
//         newErr.originalError = e;
//         throw newErr;
//     }
// }
//
// const tryControllFlow = async () => {
//     const array = [1,2,3,4,5,6,7,8,9]
//     for (let number of array) {
//         console.log(number)
//     }
//     console.log('不等for?')
//     return 'finish'
// }
//
// tryControllFlow().then((result) => {
//     console.log(result)
// })



