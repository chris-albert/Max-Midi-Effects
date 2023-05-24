
inlets = 3
outlets = 4

var CHANNEL_FILTER = null
var TYPE_FILTER = null

function bang() {
		post("saw a bang")
		post()
}	

var CONTROL_BYTE = "B0"
var NRPN_MSB = "63"
var NRPN_LSB = "62"
var DATA_MSB = "06"
var DATA_LSB = "26"

var prev_byte = null
var prev_prev_byte = null


var message_buffer = [null, null, null, null]

function flush_buffer() {
	    
		if(TYPE_FILTER == null || TYPE_FILTER == message_buffer[1]) {
			if(CHANNEL_FILTER == null || CHANNEL_FILTER == message_buffer[0]) {
				outlet(0, get_int_from_hex(message_buffer[0]))
				outlet(1, get_int_from_hex(message_buffer[1]))
				outlet(2, get_int_from_hex(message_buffer[2]))
				outlet(3, get_int_from_hex(message_buffer[3]))
			}
		}
		message_buffer[0] = null
		message_buffer[1] = null
		message_buffer[2] = null
		message_buffer[3] = null
}
/**
 * byte here is the hex string representation of the byte
 */ 
function process_message(byte) {
	
	if(prev_prev_byte == CONTROL_BYTE) {
		
		if(prev_byte == NRPN_MSB) {
			message_buffer[0] = byte
		} else if(prev_byte == NRPN_LSB) {
			message_buffer[1] = byte
		} else if(prev_byte == DATA_MSB) {
			message_buffer[2] = byte
		} else if(prev_byte == DATA_LSB) {
			message_buffer[3] = byte
			flush_buffer()
		}
	}
	
	prev_prev_byte = prev_byte
	prev_byte = byte
	
}

function msg_int(i) {
	if(inlet == 0) {
		process_message(get_hex_from_int(i))
	} else if(inlet == 1) {
	    CHANNEL_FILTER = get_hex_from_int(i)
	} else if(inlet == 2) {
		TYPE_FILTER = get_hex_from_int(i)
	}
}

function get_hex_from_int(i) {

	var out = i.toString(16).toUpperCase()
	if(i <= 15) {
		return "0" + out
	} else {
		return out
	}
}

function get_int_from_hex(hex) {
	return parseInt(hex, 16)
}