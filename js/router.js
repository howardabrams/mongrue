var Db         = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server     = require('mongodb').Server;
var responses  = require('./responses');

function route(handle, method, objname, id, query, body, response) {

  if (typeof handle[method] === 'function') {

    var db = new Db('test', new Server('localhost', Connection.DEFAULT_PORT, {}));
    db.open(function(err, db) {
	db.collection(objname, function(err, collection) {
	    handle[method](response, collection, id, query, body);
	});
    });
  } 
  else {
      console.log("No " + method + " request handler found for " + objname);
      responses.sendError(response, 405, "Method not supported: " + method);
  }
}

exports.route = route;