var util = require('util')

outlets = 1

function sendJsonOutput(json) {
  outlet(0, JSON.stringify(json))
}

function init() {

  var tracks = parseTracks()
  post('Parsed ', tracks.length, ' tracks\n')
  //post('Tracks', JSON.stringify(tracks, null, 2), '\n')

  sendJsonOutput({
    type: 'init',
    tracks: tracks
  })
}

function parseTracks() {
  var api = new LiveAPI(function() {}, 'live_set')
  var tracksCount = api.getcount('tracks')
  var tracks = []
  for(var trackIndex = 0; trackIndex < tracksCount; trackIndex++) {
    var tmp = parseTrack(api, trackIndex)
    if(tmp !== undefined) {
      tracks.push(tmp)
    }
  }

  return tracks
}

function parseTrack(api, trackIndex) {
  api.path = 'live_set tracks ' + trackIndex
  var name = api.get('name')[0]
  var color = api.get('color')[0]
  if(api.get('has_midi_output')[0] === 1) {
    var clipsCount = api.getcount('arrangement_clips')
    var clips = []
    for(var clipIndex = 0; clipIndex < clipsCount; clipIndex++) {
      clips.push(parseTrackClip(api, trackIndex, clipIndex))
    }
    return {
      type: 'track',
      name: name,
      color: color,
      clips: clips
    }
  } else {
    return undefined
  }
}

function parseTrackClip(api, trackIndex, clipIndex) {
  api.path = 'live_set tracks ' + trackIndex + ' arrangement_clips ' + clipIndex
  return {
    type: 'clip',
    name: api.get('name')[0],
    color: api.get('color')[0],
    startTime: api.get('start_time')[0],
    endTime: api.get('end_time')[0],
  }
}
