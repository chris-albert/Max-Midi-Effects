outlets = 1

function sendJsonOutput(json) {
  outlet(0, JSON.stringify(json))
}

function init() {
  try {

    var task = new Task(parseTracks, this, {})
    task.execute()
  } catch (e) {
    post('Got an error', e, '\n')
  }
}

function parseTracks() {
  var api = new LiveAPI(function() {}, 'live_set')
  var tracksCount = api.getcount('tracks')
  sendJsonOutput({
    type: 'init-project',
    tracksCount: tracksCount
  })
  for(var trackIndex = 0; trackIndex < tracksCount; trackIndex++) {
    parseTrack(api, trackIndex)
  }
  post("Done parsing [", tracksCount ,"] tracks\n")
  sendJsonOutput({
    type: 'init-done'
  })
}

function parseTrack(api, trackIndex) {
  api.path = 'live_set tracks ' + trackIndex
  var name = api.get('name')[0]
  var color = api.get('color')[0]
  if(api.get('has_midi_output')[0] === 1) {
    var clipsCount = api.getcount('arrangement_clips')
    for(var clipIndex = 0; clipIndex < clipsCount; clipIndex++) {
      parseTrackClip(api, trackIndex, clipIndex)
    }
    post("Parsed track [", trackIndex, "]\n")
    sendJsonOutput({
      type: 'init-track',
      trackIndex: trackIndex,
      name: name,
      color: color,
      clipsCount: clipsCount
    })
  }
}

function parseTrackClip(api, trackIndex, clipIndex) {
  api.path = 'live_set tracks ' + trackIndex + ' arrangement_clips ' + clipIndex
  sendJsonOutput({
    type: 'init-clip',
    trackIndex: trackIndex,
    clipIndex: clipIndex,
    name: api.get('name')[0],
    color: api.get('color')[0],
    startTime: api.get('start_time')[0],
    endTime: api.get('end_time')[0],
  })
}
