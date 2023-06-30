var sysex = require('ableton-ui-sysex')

inlets = 1
outlets = 1

function beat(num) {
  outlet(0, sysex.beat(num))
}
