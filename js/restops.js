/*
 * A series of CRUD rest operations. The `exports` puts this
 * into an array that allows us to route based on the HTTP
 * method.
 *
 * Each method expects a reference to the MongoDB, and knows
 * how to work the database based on RESTful expectations.
 * Yeah, I have no idea what that comment means either. Just
 * seeing if you are paying attention.
 */

var util = require('util');
var BSON = require('mongodb').BSONPure;
var responses = require('./responses');

/**
 * READ ALL
 * --------
 * Returns the entire collection requested.
 * @TODO: Need to accept and process query parameters to limit what is returned.
 */
function readAll(response, collection, params) {
    console.log("GET all FROM " + getDatabaseInfo(collection) );
    var query = {}
    if (params.query) {
	query=JSON.parse(params.query);
        console.log("Query: "+query);
    }
    collection.find(query, params).toArray(function(err, items) {
        responses.sendItems(response, items);
	collection.db.close();
    });
}

/**
 * READ ONE
 * --------
 * Given an ID, we need to look up an item in the collection,
 * and return it.
 */
function read(response, collection, id, query, body) {
    if ( id ) {
        console.log("GET " + id + " FROM " + getDatabaseInfo(collection) );
        
        collection.find( getIdQuery(id) ).toArray(function(err, items) {

            if ( items && items[0] ) {
                responses.sendItems(response, items[0]);
            }
            else {
                responses.sendError(response, 404, "Not found by ID: " + id );
            }                 
	    collection.db.close();
        });
    }
    else {
        readAll(response, collection, query, body);
    }
}

/**
 * CREATE
 * --------
 * Creates a new entry based on a body containing a JSON
 * document.
 *
 * Note: `id` and `query` will most likely be undefined, and 
 *       are ignored.
 */

function create(response, collection, id, query, body) {
    console.log("POST new " + getDatabaseInfo(collection) );

    var options = {safe:true}
    collection.insert(body, options, function(err, objects) {
        if (err) {
            responses.sendDbError(response, err);
        }
        else {
            responses.sendItem(response, objects);
        }
	collection.db.close();
    });
}

/**
 * UPDATE
 * --------
 * Given an ID and a body containing a new JSON document, 
 * this will update an existing entry.
 */
function update(response, collection, id, query, body) {
    console.log("PUT " + id + " FROM " + getDatabaseInfo(collection) );

    var sort = [];
    var options = {safe:true}
    collection.findAndModify(getIdQuery(id), sort, body, options, function(err, objects) {
        if (err) {
            responses.sendDbError(response, err);
        }
        else {
            responses.sendItem(response, objects);
        }
	collection.db.close();
    });
}

/**
 * UPSERT
 * --------
 * Given an ID and a body containing a new JSON document, 
 * this will update an existing entry or insert a new one
 * if the ID was not found. Called from a POST with ID.
 */
function upsert(response, collection, id, query, body) {
    console.log("POST " + id + " FROM " + getDatabaseInfo(collection) );

    var options = {upsert:true, safe:true, multi:false}
    collection.update(getIdQuery(id), {$set: body}, options, function(err, count) {
        if (err || count != 1) {
            responses.sendDbError(response, err);
        }
        else {
            responses.sendOK(response);
        }
	collection.db.close();
    });
}


/**
 * DELETE
 * --------
 * Given an ID, this will delete an entry that matches.
 */
function remove(response, collection, id) {
    console.log("DELETE " + id + " FROM " + getDatabaseInfo(collection) );
    collection.remove( getIdQuery(id), function(err, result) {
        responses.sendOK(response);
	collection.db.close();
    });
}

var handle = {};
handle["GET"]    = read;
handle["POST"]   = create;
handle["PUT"]    = update;
handle["DELETE"] = remove;
handle["UPSERT"] = upsert;

exports.handle = handle;


/**
 * We want to be able to specify either the internal "_id" or
 * object-specific "id" parameter. So, if we can convert the
 * id value given to us into an ObjectID(), then we know which
 * query we should build, otherwise, we assume it is the "id"
 * property with an integer.
 */
function getIdQuery(id) {
    try {
        var oid = new BSON.ObjectID(id);
        return { "_id" : oid };
    }
    catch (err) {
        return { "id" : id - 0 };
    }
}

/**
 * Given a Mongo database connection with collection reference,
 * let's see if we can extract useful information to log.
 */
function getDatabaseInfo(db) {
    return db.db.databaseName + "." + db.collectionName;
}
