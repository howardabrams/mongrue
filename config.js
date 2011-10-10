/**
 * This file contains the configuration values for the
 * system.
 */
// Working within CloudFoundry's environment could be pretty cool,
// so let's check for it:
exports.values = {
 
	// The host that this server attaches to. Normally, localhost:
	host : (process.env.VCAP_APP_HOST || 'localhost'),

    // The port that this server listens for REST requests:
    port: Number(process.env.VMC_APP_PORT || 8888),

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
    },

    // Mongrue is NOT a web server, but in order to use jQuery's QUnit as
    // a testing framework, I need to server up some web server pages. Since
    // I do not want to depend on the excellent "collection" package (or any
    // thing similar), I put together a simple 10 line web server that serves
    // non-image files in any directory listed below:

    serverPages: {
	"/test": true   // Oh yeah, the initial slashes are important.
    }
};