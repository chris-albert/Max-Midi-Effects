var util = require('util')

var clipListeners = null

function loadbang() {

    post('loaded process.js\n')
    init()
}

function init() {

    post('init\n')
    clipListeners = []
    // util.songBeatListener(songTimeListener)

    var track = parseTrack()
    post('Track', JSON.stringify(track, null, 2), '\n')

    var clipListener = ClipListener(track, function(status, clip, value) {
        post('Clip [', clip.name, '][', status, '][', value, ']\n')
    })
    util.songBeatListener(clipListener.listener)
}

function ClipListener(track, cb) {

    var trackClipsLength = track.clips.length
    var segments = buildSegments()

    var segmentLength = segments.length
    var activeIndex = null
    var lastValue = 0

    function buildSegments() {
        var segments = []
        var lastEndTime = 0
        for(var i = 0; i < trackClipsLength; i++) {
            var clip = track.clips[i]

            if(lastEndTime !== clip.startTime) {
                segments.push({
                    type     : 'empty',
                    name     : 'empty',
                    startTime: lastEndTime,
                    endTime  : clip.startTime
                })
            }

            segments.push(clip)

            if(i + 1 >= trackClipsLength) {
                segments.push({
                    type     : 'empty',
                    name     : 'empty',
                    startTime: clip.endTime,
                    endTime  : null
                })
            }

            lastEndTime = clip.endTime
        }
        post('segments', JSON.stringify(segments, null, 2), '\n')
        return segments
    }

    var obj = {

        activateIndex: function(index, value) {
            if(segments[index].type !== 'empty') {
                cb('active', segments[index], value)
            }
        },

        deactivateIndex: function(index, value) {
            if(segments[index].type !== 'empty') {
                cb('de-active', segments[index], value)
            }
        },

        findActiveIndex: function(value) {
            for(var i = 0; i < segmentLength; i++) {
                if(obj.isActive(value, i)) {
                    return i
                }
            }
            return null
        },

        isActive: function(value, index) {
            return value >= segments[index].startTime &&
              (segments[index].endTime === null || value <= segments[index].endTime)
        },

        searchActiveIndex: function(value) {
            // post('searchActiveIndex [', value, ']\n')
            var prevActiveIndex = activeIndex
            activeIndex = obj.findActiveIndex(value)
            if (activeIndex !== null) {
                if(prevActiveIndex !== activeIndex) {
                    obj.deactivateIndex(prevActiveIndex, value)
                    obj.activateIndex(activeIndex, value)
                }
            }
        },

        isLastIndex: function(index) {
            return index + 1 >= segmentLength
        },

        setNextActive: function(value) {
            obj.deactivateIndex(activeIndex, value)
            activeIndex++
            obj.activateIndex(activeIndex, value)
        },

        isNextActive: function(value) {
           if(!obj.isLastIndex(activeIndex + 1)) {
               return obj.isActive(value, activeIndex + 1)
           } else {
               return false
           }
        },

        handleNormalFlow: function(value) {
            if(obj.isActive(value, activeIndex)) {
                if(obj.isNextActive(value)) {
                    obj.setNextActive(value)
                }
            } else {
                //we passed the active point
                obj.setNextActive(value)
            }
        },

        handleSkipFlow: function(value) {
            obj.searchActiveIndex(value)
        },

        listener: function(value) {
            if(lastValue + 1 === value && activeIndex !== null) {
                obj.handleNormalFlow(value)
            } else {
                obj.handleSkipFlow(value)
            }
            lastValue = value
        }
    }
    return obj
}

function songTimeListener(value) {
    post('songTimeListener', value, '\n')
}

function parseTrack() {
    var api = new LiveAPI(function() {}, 'this_device canonical_parent')
    var name = api.get('name')
    var clipsCount = api.getcount('arrangement_clips')
    var clips = []
    for(var clipIndex = 0; clipIndex < clipsCount; clipIndex++) {
        clips.push(parseTrackClip(api, clipIndex))
    }
    return {
        type: 'track',
        path: api.path,
        name: name[0],
        clips: clips
    }
}

function parseTrackClip(api, clipIndex) {
    api.path = 'this_device canonical_parent arrangement_clips ' + clipIndex
    return {
        type: 'clip',
        path: api.path,
        name: api.get('name')[0],
        startTime: api.get('start_time')[0],
        endTime: api.get('end_time')[0],
    }
}
