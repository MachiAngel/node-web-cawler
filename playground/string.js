

var name = '美金(USD)'

// const sliceName = name.substring(name.length-1,name.length-4)

// console.log(sliceName)
function getPrintableChars(str) {
    const matches = str.match("[a-zA-Z]");
    let a = '';
    matches.forEach(item => item && (a += item));
    
}

var str = getPrintableChars(name)
console.log(str)
