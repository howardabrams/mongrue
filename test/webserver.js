var fs     = require('fs');
var path   = require('path');
var config = require('../config');

/**
 * This checks that a given HTTP pathname is available to
 * be served by the web server function, as given by the
 * pages object.
 */
function available(pages, filepath)
{
    if (pages) {
        for (page in pages) {
            if (filepath.indexOf(page) == 0) {
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
function sendWebfile(response, filepath) 
{
    var file = filepath.substring(1);

    // If an initial directory is specified (one without an '.'
    // extension or a slash), then redirect to a directory with
    // a trailing slash.
    if (!/[\.\/]/.test(file)) {
        response.writeHead(302, {
           "Location": "http://localhost:"+config.values.port+"/" + file + "/"
        });
        response.end();
        return;
    }
    // End in a slash? Serve up the index.html file...
    if (/\/$/.test(file)) {
        file = file + 'index.html';
    }

    var type = "text/html";
    var extname = path.extname(file);
    switch (extname) {
        case '.js':
            type = 'text/javascript';
            break;
        case '.css':
            type = 'text/css';
            break;
    }

    path.exists(file, function(exists) {
        if (exists) {
            fs.readFile(file, 'utf8', function (err, data) {
                if (err) {
                    response.writeHead(500);
                    response.end();                        
                }
                sendFile(response, type, data);
            });
        }
        else {
            response.writeHead(404);
            response.end();            
        }
    });
}

/**
 * This function sends some arbitrary HTML gunk.
 */
function sendFile(response, type, data) {
    var body;
    if (data) {
        body = new Buffer(data);
    }
    else {
        body = new Buffer();
    }

    response.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': type });
    response.end(data);
}

exports.available = available;
exports.sendWebfile = sendWebfile;