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

    var clips = track.clips
    var clipSize = clips.length
    var activeIndex = null

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

function ClipListener2(track, cb) {

    var clipSize = track.clips.length
    var nextIndex = 0
    var currentIndex = null
    var startTimeIndexLookup = {}

    util.forEach(track.clips, function(clip, index) {
        startTimeIndexLookup[clip.startTime] = index
    })

    var obj = {
        findNextIndex: function(value) {
            post('findNextIndex [', value, ']\n')

        },
        listener: function(value) {
            post('ClipListener [', value, ']\n')
            if(currentIndex !== null && value >= track.clips[currentIndex].endTime) {
                //We have just exited current clip
                post("Just exited track [", track.clips[currentIndex].name, ']\n')
                currentIndex = null
            }
            // if(nextIndex >= clipSize) {
            //     //We are past the end of our clips, just exit
            //     return
            // }
            if (nextIndex < clipSize && value >= track.clips[nextIndex].startTime) {
                //We have entered the next clip
                currentIndex = nextIndex
                nextIndex++
                post("Just entered track [", track.clips[currentIndex].name, ']\n')
                return
            }
            if (currentIndex !== null && value < track.clips[currentIndex].startTime) {
                //We are before we should be in the song, set indexes accordingly
                obj.findNextIndex(value)
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