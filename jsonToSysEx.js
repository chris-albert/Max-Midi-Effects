
inlets = 1
outlets = 1

var sysExStart = 240
var sysExEnd = 247

function json(input) {
  var length = input.length
  var outArr = [sysExStart]
  for(var i = 0; i < length; i++) {
    outArr.push(input.charCodeAt(i))
  }
  outArr.push(sysExEnd)
  outlet(0, outArr)
}