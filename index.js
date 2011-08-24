var server  = require("./js/server");
var router  = require("./js/router");
var restops = require("./js/restops");

server.start(router.route, restops.handle);