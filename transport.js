var sysex = require('ableton-ui-sysex')

outlets = 1

function barBeat(num) {
  outlet(0, sysex.barBeat(num))
}

function sig(count, duration) {
  outlet(0, sysex.sig(count, duration))
}

function tempo(tempo) {
  outlet(0, sysex.tempo(tempo))
}

