var api = new LiveAPI(cb, "this_device canonical_parent")
if (!api) {
  post("no api object\n")
}

function bang() {
	post("hi there, in a bang\n")
	
}

function cb(args) {
	post("init, woohoo\n")
	post(api.path)
}