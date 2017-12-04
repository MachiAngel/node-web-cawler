
const convertStringToNumberFunction = (str) => {
    return /^\d+\.?\d*$/.test(str) ? Number(str) : 0
}

module.exports.convertStringToNumberFunction = convertStringToNumberFunction