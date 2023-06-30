var sysex = require('ableton-ui-sysex')

outlets = 1

function barBeat(num) {
  outlet(0, sysex.barBeat(num))
}

function sig(nums) {
  outlet(0, sysex.barBeat(nums[0], nums[1]))
}

function tempo(tempo) {
  outlet(0, sysex.tempo(tempo))
}

