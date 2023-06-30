var sysex = require('ableton-ui-sysex')

inlets = 1
outlets = 1

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

    outlet(0, sysex.init())

    forEach(tracks.tracks, function(track) {
        outlet(0, sysex.track(track.name, track.trackIndex,  track.color))
    })

    forEach(tracks.clips, function(clip) {
        outleet(0, sysex.clip(clip.name, clip.trackIndex, clip.clipIndex, clip.color, clip.startTime, clip.endTime))
    })

    outlet(0, sysex.done())
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
