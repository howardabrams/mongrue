/**
 * This "router" is pretty simple, in that it opens up a connection to the
 * MongoDB instance (on the localhost, mind you), and then calls the appropriate
 * REST handler based on the method.
 */

var dbconn = require('./dbconn');
var responses = require('./responses');
var mongodb = require('mongodb');

function route(handle, method, objname, id, query, body, response, config) {

	if (typeof handle[method] === 'function') {

		mongodb.connect(dbconn.connectURL(config), function(err, conn) {

			conn.collection(objname, function(err, collection) {
				if (method == 'POST' && id) {
					method = 'UPSERT';
				}
				handle[method](response, collection, id, query, body, config);
			});
		});
	} 
	else {
		responses.sendError(response, 405, "Method not supported: " + method);
	}
}

exports.route = route;