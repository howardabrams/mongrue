/**
 * The Server modules that begins a Node.js Server on a specific port for us.
 */

var http      = require("http");
var url       = require("url");
var responses = require("./responses");

var port      = 8888;

function start(route, handle) {
    function onRequest(request, response) {

	var u        = url.parse(request.url, parseQueryString=true);

        var parts      = u.pathname.split("/");
	var collection = parts[1];
	var id         = parts[2];
        // console.log(request.method + " request for " + id + " from " + collection);

	request.setEncoding("utf8");

	var body = "";
	request.addListener("data", function(bodyChunk) {
	    body += bodyChunk;
	    console.log("Received POST data chunk '"+bodyChunk + "'.");
	});

	// When we are all done getting all of the body data, we then route it...
	request.addListener("end", function() {
	    try {
		var jsonBody = "";
		if (body.length > 0) {  // Let's not parse the body if none is given.
		    jsonBody = JSON.parse(body);
		}
		route(handle, request.method, collection, id, u.query, jsonBody, response);
	    }
	    catch (error) {
		responses.sendError(response, 400, "Could not parse body: " + error + " (Remember to use double quotes, instead of single quotes)");
	    }
	});
    }

    http.createServer(onRequest).listen(port);
    console.log("Server has started on port: " + port);
}

exports.start = start;