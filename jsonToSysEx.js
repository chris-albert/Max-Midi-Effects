
inlets = 1
outlets = 1

var sysExStart = 240 //F0
var sysExEnd = 247 //F7

function json(input) {
  var length = input.length
  var outArr = [sysExStart]
  for(var i = 0; i < length; i++) {
    outArr.push(input.charCodeAt(i))
  }
  outArr.push(sysExEnd)
  outlet(0, outArr)
}