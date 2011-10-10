/**
 * Since the database access is becoming more complicated if we start to work
 * with CloudFoundry and other PaaS systems, we have this file abstract that.
 */

var Db         = require('mongodb').Db,
    Server     = require('mongodb').Server;

function connect(config)
{
	var boundServices = process.env.VCAP_SERVICES ?
			JSON.parse(process.env.VCAP_SERVICES) : null;

	// Are we running in a CloudFoundry world? Well, get the database
	// credentials from the environment, and replace what we find in the
	// config section.
			
	if (boundServices != null) {
		var credentials = boundServices['mongodb-1.8'][0]['credentials'];
				
		config.mongoHostname = credentials["hostname"];
		config.mongoPort     = credentials["port"];
		config.mongoDatabase = credentials["db"];
		config.mongoUsername = credentials["username"];
		config.mongoPassword = credentials["password"];
	}

	return generate_mongo_url(config);
}

/**
 * Simply generates a Mongo Database URL connection based on values found
 * in the <code>config</code> object. Looks for the following:
 * 
 * <ul>
 * <li> mongoHostname - The host to connect. Defaults to <code>localhost</code> </li>
 * <li> mongoPort - The port number of the database. Defaults to <code>27017</code> </li>
 * <li> mongoDatabase - The name of the database to use. Defaults to <code>test</code> </li>
 * <li> mongoUsername - The database user's account. Not used if not set. Really only useful if connecting to CloudFoundry, </li>
 * <li> mongoPassword - The user account's database password. Not used if not set. Really only useful if connecting to CloudFoundry, </li>
 * </ul> 
 */
var generate_mongo_url = function(config) 
{
  config.mongoHostname = (config.mongoHostname || 'localhost');
  config.mongoPort     = (config.mongoPort || 27017);
  config.mongoDatabase = (config.mongoDatabase || 'test');

  if (config.mongoUsername && config.mongoPassword) {
    return "mongodb://" + config.mongoUsername + ":" + config.mongoPassword + "@" + 
                          config.mongoHostname + ":" + config.mongoPort + "/" + config.mongoDatabase;
  }
  else {
    return "mongodb://" + config.mongoHostname + ":" + config.mongoPort + "/" + config.mongoDatabase;
  }
};

exports.connectURL = connect;