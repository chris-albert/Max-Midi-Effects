var util = require('util')

inlets = 1
outlets = 1

var chunkSize = 2

var api = null

function sendJsonOutput(json) {
  outlet(0, JSON.stringify(json))
}

function init() {

  var tracks = parseTracks()
  post('Parsed ', tracks.tracks.length, ' tracks\n')

  emitTracks(tracks)
}

function emitTracks(tracks) {

  util.chunk(tracks.tracks, function(chunk) {
    sendJsonOutput({
      type: 'init-tracks',
      tracks: chunk
    })
  }, chunkSize)

  util.chunk(tracks.clips, function(chunk) {
    sendJsonOutput({
      type: 'init-clips',
      tracks: chunk
    })
  }, chunkSize)
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
      clips.concat(tmp.clips)
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
