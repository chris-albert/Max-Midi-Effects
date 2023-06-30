outlets = 1

var api = null

function init() {
  if(api !== null) {
    api = new LiveApi(function(prop, value) {
      if(prop === 'current_song_time') {
        outlet(0, value)
      }
    }, 'live_set')
    api.property = 'current_song_time'
  }
}