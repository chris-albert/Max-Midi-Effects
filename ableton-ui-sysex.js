var DATA_DELIMITER = 0x01
var MANUFACTURER_ID = 0xE7

var STATUS = {
  INIT: 0x03,
  DONE: 0x04,
  TRACK: 0x05,
  CLIP: 0x06,
  BEAT: 0x07,
  BAR_BEAT: 0x08,
  SIG: 0x09,
  TEMPO: 0x0A
}

var SYSEX = {
  START: 0xF0,
  END: 0xF7
}

function toBytes(input) {
  post("input: " + input + "\n")
  var raw = JSON.stringify(input).replaceAll("\"", "")
  var length = raw.length
  var outArr = []
  for(var i = 0; i < length; i++) {
    outArr.push(raw.charCodeAt(i))
  }
  return outArr
}

/**
 * Formats sysex message
 * @param data Array of data to send
 */
function sysex(datas) {
  var length = datas.length
  var outArr = [SYSEX.START, MANUFACTURER_ID]
  for(var i = 0; i < length; i++) {
    outArr = outArr.concat(toBytes(datas[i]))
    if(i < length - 1) {
      outArr.push(DATA_DELIMITER)
    }
  }
  outArr.push(SYSEX.END)
  return outArr
}

exports.init = function() {
  return sysex([STATUS.INIT])
}

exports.done = function() {
  return sysex([STATUS.DONE])
}

exports.track = function(name, trackIndex, color) {
  return sysex([STATUS.TRACK, name, trackIndex, color])
}

exports.clip = function(name, trackIndex, clipIndex, color, startTime, endTime) {
  return sysex([STATUS.CLIP, name, trackIndex, clipIndex, color, startTime, endTime])
}

exports.beat = function(value) {
  return sysex([STATUS.BEAT, value])
}

exports.barBeat = function(value) {
  return sysex([STATUS.BAR_BEAT, value])
}

exports.sig = function(count, length) {
  return sysex([STATUS.SIG, count, length])
}

exports.tempo = function(bpm) {
  return sysex([STATUS.TEMPO, bpm])
}