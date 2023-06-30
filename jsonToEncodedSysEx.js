
inlets = 1
outlets = 1

var DATA_DELIMITER = 0x01

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

function typeToStatus(type) {

}