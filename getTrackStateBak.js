inlets = 1
outlets = 1

var chunkSize = 10

var api = null
var tracks = null

function forEach(arr, func) {
  var length = arr.length
  for(var i = 0; i < length;i++) {
    func(arr[i], i)
  }
}

function chunk(arr, func, count) {
  var buffer = []

  forEach(arr, function(value) {
    buffer.push(value)
    if(buffer.length >= count) {
      func(buffer)
      buffer = []
    }
  })

  if(buffer.length > 0) {
    func(buffer)
  }
}

function sendJsonOutput(json) {
  outlet(0, JSON.stringify(json))
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

  sendJsonOutput({
    type: 'init-project',
    tracksCount: tracks.tracks.length
  })

  chunk(tracks.tracks, function(chunk) {
    sendJsonOutput({
      type: 'init-tracks',
      tracks: chunk
    })
  }, chunkSize)

  chunk(tracks.clips, function(chunk) {
    sendJsonOutput({
      type: 'init-clips',
      clips: chunk
    })
  }, chunkSize)

  sendJsonOutput({
    type: 'init-done'
  })
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
