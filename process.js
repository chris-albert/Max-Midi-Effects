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

    var segmentLength = segments.length
    var activeIndex = null
    var lastValue = 0

    // post('segments', JSON.stringify(segments, null, 2), '\n')

    var obj = {

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
              value <= segments[index].endTime
        },

        searchActiveIndex: function(value) {
            post('searchActiveIndex [', value, ']\n')
            activeIndex = obj.findActiveIndex(value)
            if (activeIndex !== null) {
                obj.activateIndex(activeIndex, value)
            }
        },

        handleNormalFlow: function(value) {

        },

        handleSkipFlow: function(value) {
            obj.searchActiveIndex(value)
        },

        listener: function(value) {
            if(lastValue + 1 === value) {
                obj.handleNormalFlow(value)
            } else {
                obj.handleSkipFlow(value)
            }
            lastValue = value
        }
    }
    return obj
}

function ClipListener2(track, cb) {

    var clips = track.clips
    var clipSize = clips.length
    var activeIndex = null
    var nextIndex = null

    var obj = {
        findActiveIndex: function(value) {
            for(var i = 0; i < clipSize; i++) {
                if(obj.isActive(value, i)) {
                    return i
                }
            }
            return null
        },

        isActive: function(value, index) {
            return value >= clips[index].startTime &&
              value <= clips[index].endTime
        },


        isLastIndex: function(index) {
            return index + 1 === clipSize
        },

        isFirstIndex: function(index) {
            return index === 0
        },

        isNextClipActive: function(value, index) {
            return !obj.isLastIndex(index) &&
              value >= clips[index + 1].startTime
        },

        activateIndex: function(index, value) {
            cb('active', clips[index], value)
        },

        deactivateIndex: function(index, value) {
            cb('de-active', clips[index], value)
        },

        isValueBetweenNextIndex: function(index) {

        },

        /**
         * - Is an active clip
         *  - But we could also be activating next
         *   - Deactivate active
         *   - Activate next
         * - Just stopped being active
         *  - Deactivate active
         */
        handleActiveClip: function(value, index) {
            if(obj.isActive(value, index)) {
                if(obj.isNextClipActive(value, index)) {
                    activeIndex++
                    obj.activateIndex(activeIndex, value)
                    obj.deactivateIndex(index, value)
                } else {
                    //we are just in the active clip, so do nothing
                }
            } else {
                activeIndex = null
                obj.deactivateIndex(index, value)
                if(!obj.isLastIndex(index)) {

                }
                obj.searchActiveIndex(value)
            }
        },

        searchActiveIndex: function(value) {
            post('searchActiveIndex [', value, ']\n')
            activeIndex = obj.findActiveIndex(value)
            if (activeIndex !== null) {
                obj.activateIndex(activeIndex, value)
            }
        },

        listener: function(value) {
            // post('ClipListener [', value, ']\n')
            if(activeIndex !== null) {
                obj.handleActiveClip(value, activeIndex)
            } else {
                obj.searchActiveIndex(value)
            }
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
