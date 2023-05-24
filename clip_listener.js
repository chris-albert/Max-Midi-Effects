var api = new LiveAPI(cb, "this_device canonical_parent")

function bang() {
	post("hi there, in a bang\n")
	post("Track Name: " + api.get("name") + "\n")
	const clips = api.get("arrangement_clips")
	const clipCount = api.getcount("arrangement_clips")
	post("got " + clipCount + " clips\n")
	for(var i = 0; i < clipCount; i++) {
		post("Track " + i + " - " + clips[i].get("name") + "\n")
	} 
}	

function cb(args) {

}