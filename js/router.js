/**
 * This "router" is pretty simple, in that it opens up a connection to
 * the MongoDB instance (on the localhost, mind you), and then calls
 * the appropriate REST handler based on the method.
 */

var Db         = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server     = require('mongodb').Server;
var responses  = require('./responses');

function route(handle, method, objname, id, query, body, response, config) {

  if (typeof handle[method] === 'function') {

    var db = new Db(config.mongoDatabase, 
		    new Server(config.mongoHostname, Connection.DEFAULT_PORT, {}));
    db.open(function(err, db) {
        db.collection(objname, function(err, collection) {
            handle[method](response, collection, id, query, body, config);
        });
    });
  } 
  else {
      responses.sendError(response, 405, "Method not supported: " + method);
  }
}

exports.route = route;