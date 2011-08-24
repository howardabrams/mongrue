/*
 * As you can tell, this doesn't do that much.
 * It pulls in the modules, and starts the
 * server with the router code, and the
 * restops (REST Operations).
 */

var server  = require("./js/server");
var router  = require("./js/router");
var restops = require("./js/restops");

server.start(router.route, restops.handle);