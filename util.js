
exports.printApi = function(api) {
    post('Id', api.id, '\n')
    post('Path', api.path, '\n')
    post('Children', api.children, '\n')
    post('Property', api.property, '\n')
    post('Proptype', api.proptype, '\n')
}

exports.observe = function(path, property, cb) {
    function temp(prop) {
        if(prop[0] === property) {
            cb(prop[1])
        }
    }
    var api = new LiveAPI(temp, path)
    api.property = property
    return api
}

exports.memo = function(cb) {
    var called = false
    function inner(a) {
        if(!called) {
            post('not called yet, do init \n')
            cb(a)
            called = true
        }      
    }
    return inner
}
 
var memoSongTimeListener = exports.memo(
    function(cb) {
        exports.observe('live_set', 'current_song_time', cb)
    }
)

exports.songTimeListener = function(cb) {
    memoSongTimeListener(cb)
}

exports.songBeatListener = function(cb) {
    var deduper = exports.dedup(cb)
    return memoSongTimeListener(function(a) {
        deduper(Math.floor(a))
    })
}

exports.dedup = function(cb) {
    var value = null
    return function(input) {
        if(input !== value) {
            cb(input)
            value = input
        } 
    }
}

exports.foldLeft = function(arr, init, func) {
    var length = arr.length
    var accu = init
    for(var i = 0; i < length;i++) {
        accu = func(accu, arr[i])
    }
    return accu
}

exports.map = function(arr, func) {
    var outArr = []
    var length = arr.length
    for(var i = 0; i < length;i++) {
        outArr.push(func(arr[i]))
    }
    return outArr
}

exports.forEach = function(arr, func) {
    var length = arr.length
    for(var i = 0; i < length;i++) {
        func(arr[i], i)
    }
}

exports.ifNotNull = function(value, ifNotNull) {
    if(value === null) {
        return null
    } else {
        return ifNotNull(value)
    }
}

exports.log = function() {

    post(arguments, '\n')
}

exports.get_hex_from_int = function (i) {

    var out = i.toString(16).toUpperCase()
    if(i <= 15) {
        return "0" + out
    } else {
        return out
    }
}