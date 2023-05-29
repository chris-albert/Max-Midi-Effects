var util = require("./util");

outlets = 2

function sendJsonOutput(json) {
  outlet(1, JSON.stringify(json))
}

function init() {

  util.songBeatListener(function(value) {
    post('Emit Beats: ', value, '\n')
    outlet(0, value)
    sendJsonOutput({
      type: 'beat',
      value: value
    })
  })
}