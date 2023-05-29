var util = require("./util");

function init() {

  util.songBeatListener(function(value) {
    outlet(0, value)
  })
}