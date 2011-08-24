var util = require('util');

/**
 * This function takes an "object" or "array" and sends the
 * results to the client in a standard way.
 */
function sendItems(response, items) {
    if (items) {
	console.log("Sending: " + util.inspect(items, false, null));

	var body = JSON.stringify(items);
	// response.setEncoding('utf8');
	response.writeHead(200, {
	    'Content-Length': body.length,
	    // TODO: Replace with Buffer.byteLength()
	    'Content-Type': 'application/json' });
	response.write( body );
	response.end();
    }
    else {
	sendError(response, 404, "Nothing to return");
    }
}

/**
 * Sometimes we know, we have one item to send back (like during a POST),
 * but the data returns an array collection. In these cases, we'll want
 * to flatten it, if it makes sense.
 */
function sendItem(response, items) {
    if (items) {
	if (items.length == 0) {
	    sendOK(response);
	}
	else if (items.length == 1) {
	    sendItems(response, items[0]);
	}
	else {
	    sendItems(response, items);
	}
    }
    else {
	sendOK(response);
    }
}

/**
 * All errors should have a standard response, right? I mean, should
 * this be a plain message, or a JSON formatted message?
 */
function sendError(response, code, message) {
    console.warn("Error: " + code + " " + message);

    response.writeHead(code, {"Content-Type": "text/plain"});
    response.write( code + " " + message );
    response.end();
}

/**
 * Here, we are given a collection of database errors that we can
 * try to abstract and give nice messages.
 */
function sendDbError(response, err) {
    console.warn(err.message);
    if (err.message.indexOf('E11000 ') !== -1) {
	sendError(response, 406, "ID already taken. Try not specifying that.");
    }
    else {
	responses.sendError(response, 400, "Database access error: " + err.message);
    }
}

/**
 * What if what we send back isn't as important as just an OK
 * response (a non-error)?
 */
function sendOK(response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("OK");
    response.end();
}

exports.sendItems   = sendItems;
exports.sendItem    = sendItem;
exports.sendOK      = sendOK;
exports.sendError   = sendError;
exports.sendDbError = sendDbError;
