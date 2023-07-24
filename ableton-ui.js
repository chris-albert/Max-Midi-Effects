var DATA_DELIMITER = 0x01
var MANUFACTURER_ID = 0x02

var STATUS = {
  INIT: 0x03,
  DONE: 0x04,
  TRACK: 0x05,
  CLIP: 0x06,
  BEAT: 0x07,
  BAR_BEAT: 0x08,
  SIG: 0x09,
  TEMPO: 0x0A,
  IS_PLAYING: 0x0B
}

var SYSEX = {
  START: 0xF0,
  END: 0xF7
}

function toBytes(input) {
  var raw = JSON.stringify(input).replace(/\"/g, "")
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

var Message = {
  init: function() {
    return sysex([STATUS.INIT])
  },
  done: function() {
    return sysex([STATUS.DONE])
  },
  track: function(name, trackIndex, color) {
    return sysex([STATUS.TRACK, name, trackIndex, color])
  },
  clip: function(name, trackIndex, clipIndex, color, startTime, endTime) {
    return sysex([STATUS.CLIP, name, trackIndex, clipIndex, color, startTime, endTime])
  },
  beat: function(value) {
    return sysex([STATUS.BEAT, value])
  },
  barBeat: function(value) {
    return sysex([STATUS.BAR_BEAT, value])
  },
  sig: function(count, length) {
    return sysex([STATUS.SIG, count, length])
  },
  tempo: function(bpm) {
    return sysex([STATUS.TEMPO, bpm])
  },
  isPlaying: function(playing) {
    return sysex([STATUS.IS_PLAYING, playing])
  }
}

inlets = 1
outlets = 1

function beat(num) {
  outlet(0, Message.beat(num))
}

function barBeat(num) {
  outlet(0, Message.barBeat(num))
}

function sig(count, duration) {
  outlet(0, Message.sig(count, duration))
}

function tempo(num) {
  outlet(0, Message.tempo(num))
}

function isPlaying(num) {
  outlet(0, Message.isPlaying(num))
}

var api = null
var tracks = null

function forEach(arr, func) {
  var length = arr.length
  for(var i = 0; i < length;i++) {
    func(arr[i], i)
  }
}

function init() {

  post('Parsing tracks\n')
  tracks = parseTracks()
  post('Parsed ', tracks.tracks.length, ' tracks\n')

  post('Emitting tracks\n')
  emitTracks(tracks)
  post('Done emitting tracks\n')
  tracks = null
}

function emitTracks(tracks) {

  outlet(0, Message.init())

  forEach(tracks.tracks, function(track) {
    outlet(0, Message.track(track.name, track.trackIndex,  track.color))
  })

  forEach(tracks.clips, function(clip) {
    outlet(0, Message.clip(clip.name, clip.trackIndex, clip.clipIndex, clip.color, clip.startTime, clip.endTime))
  })

  outlet(0, Message.done())
}

function parseTracks() {

  api = new LiveAPI(function() {}, 'live_set')
  var tracksCount = api.getcount('tracks')
  var tracks = []
  var clips = []
  for(var trackIndex = 0; trackIndex < tracksCount; trackIndex++) {
    var tmp = parseTrack(trackIndex)
    if(tmp !== undefined) {
      tracks.push(tmp.track)
      clips = clips.concat(tmp.clips)
    }
  }

  return {
    tracks: tracks,
    clips: clips
  }
}

function parseTrack(trackIndex) {

  api.path = 'live_set tracks ' + trackIndex
  var name = api.get('name')[0]
  var color = api.get('color')[0]
  if(api.get('has_midi_output')[0] === 1) {
    var clipsCount = api.getcount('arrangement_clips')
    var clips = []
    for(var clipIndex = 0; clipIndex < clipsCount; clipIndex++) {
      clips.push(parseTrackClip(trackIndex, clipIndex))
    }
    return {
      track: {
        type: 'track',
        trackIndex: trackIndex,
        name: name,
        color: color
      },
      clips: clips
    }
  } else {
    return undefined
  }
}

function parseTrackClip(trackIndex, clipIndex) {
  api.path = 'live_set tracks ' + trackIndex + ' arrangement_clips ' + clipIndex
  return {
    type: 'clip',
    trackIndex: trackIndex,
    clipIndex: clipIndex,
    name: api.get('name')[0],
    color: api.get('color')[0],
    startTime: api.get('start_time')[0],
    endTime: api.get('end_time')[0],
  }
}
