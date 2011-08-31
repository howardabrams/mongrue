var fs        = require('fs');

/**
 * This checks that a given HTTP pathname is available to
 * be served by the web server function, as given by the
 * pages object.
 */
function available(pages, path)
{
    if (pages) {
	for (page in pages) {
	    if ( path.indexOf(page) == 0) {
		return true;
	    }
	}
    }
    return false;
}

/**
 * Attempts to figure out what the content type of the requested
 * file is, and sends it using our 
 */
function sendWebfile(response, path) 
{
    var file = path.substring(1);

    // End in a slash? Serve up the index.html file...
    if (/\/$/.test(file)) {
	file = file + 'index.html';
    }
	
    var type = "text/html";
    if (/\.js$/.test(file)) {
	type = "text/javascript";
    }
    else if (/\.css$/.test(file)) {
	type = "text/css";
    }
    
    try {
	fs.readFile(file, 'utf8', function (err, data) {
	    if (err) throw err;
	    sendFile(response, type, data);
	});
    }
    catch (e) {
	response.writeHead(404);
	response.end();
    }
}

/**
 * This function sends some arbitrary HTML gunk.
 */
function sendFile(response, type, data) {

    var body = new Buffer(data);

    response.writeHead(200, {
            'Content-Length': body.length,
            'Content-Type': type });
    response.end(data);
}

exports.available = available;
exports.sendWebfile = sendWebfile;