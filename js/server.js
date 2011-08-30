/**
 * The Server modules that begins a Node.js Server on a specific port for us.
 */

var http      = require("http");
var url       = require("url");
var responses = require("./responses");
var fs        = require('fs');

/*
 * Starts the server and creates the `onRequest` handler.
 * Each request is parsed and farmed off to the appropriate
 * RESTful router.
 */
function start(route, handle, config) {

    function onRequest(request, response) {

	// Let's check to make sure the connect client is even allowed
	// to play in our party room.
	if ( config.clientKey ) {
	    if (request.headers['x-mongrue-clientkey'] != config.clientKey) {
		responses.sendError(response, 403, 
                                "Invalid client authentication.");
		return;
	    }
	}
        // Before we go off and do any routing, let's split out the
        // request and get the "collection name" and the "id" ...
        var u        = url.parse(request.url, parseQueryString=true);

	if (u.pathname == "/favicon.ico") {
	    responses.sendOK(response);
	    return;
	}

	// If the path is "tests", then we return the QUnit tests. This allows
	// us to get around the cross-domain scripting sandbox that browsers
	// put us in.
	console.log("Requested: " + u.pathname);

	if (u.pathname.indexOf('/test') == 0) {
	    var file = u.pathname.substring(1);
	    if (file == 'test') {
		file = 'test/index.html';
	    }
	    var type = "text/html";
	    if (/\.js$/.test(file)) {
		type = "text/javascript";
	    }
	    else if (/\.css$/.test(file)) {
		type = "text/css";
	    }
	    fs.readFile(file, 'utf8', function (err, data) {
		if (err) throw err;
		responses.sendFile(response, type, data);
		return;
	    });
	    return;
	}

        var parts      = u.pathname.split("/");
        var collection = parts[1];

	if ( config.collectionNames && !config.collectionNames[collection] ) {
            responses.sendError(response, 400, 
                                "The resource, " + collection + ", is unavailable. ");
	    return;
	}

        var id         = parts[2];
        // console.log(request.method + " request for " + id + " from " + collection);

        request.setEncoding("utf8");
        // Hrm... node has a strange way of feeding us the body.
        // Grab each chunk and shove it into the "body" variable.
        var body = "";
        request.addListener("data", function(bodyChunk) {
            body += bodyChunk;
        });

        // When we are all done getting all of the body data,
        // we parse the data into JSON, and route it based on
        // "method" that was given to us.
        request.addListener("end", function() {
            try {
                var jsonBody = "";
                if (body.length > 0) {  // Let's not parse the body if none is given.
                    jsonBody = JSON.parse(body);
                }
                route(handle, request.method, collection, id, u.query, jsonBody, response, config);
            }
            catch (error) {
                responses.sendError(response, 400, 
                                    "Could not parse body: " + error + 
                                    " (Remember to use double quotes, instead of single quotes)");
            }
        });
    }

    http.createServer(onRequest).listen(config.port);
    console.log("Server has started on port: " + config.port);
}

exports.start = start;