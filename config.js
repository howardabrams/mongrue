/**
 * This file contains the configuration values for the
 * system.
 */
exports.values = {

    // The port that this server listens for REST requests:
    port: 8888,

    // The hostname of the MongoDB instance.
    mongoHostname: "localhost",

    // The name of the MongoDB database to use.
    mongoDatabase: "test",

    // If the 'clientKey' property is set, then it means that each client
    // that makes a request, must have the 'x-mongrue-clientkey' HTTP header
    // set to that key. It is really just a sanity test, and shouldn't be
    // relied on too much.

    // NOTE: We comment this out by default in order to make it easier to
    //       get up and running quickly.

    // clientKey: "dsk38dslgkhsgtsl",


    // An array of acceptable "collection" names. Each key must have a value
    // of true. If this section is commented out, then any collection/resource
    // can be used.
    collectionNames: {
	"unicorn": true,
	"vampire": true
    }

};