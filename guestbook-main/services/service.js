const cfenv = require('cfenv');
const CloudantClient = require('./cloudant'); //import CloudantClient class

//------------------------------------------------------------------------------
// Load the service data from vcap-local.json (root directory) 
// and initialize cf enviroment (cfenv).
// On CloudFoundry, vcap-local.json is added automatically with the connected
// services.
//------------------------------------------------------------------------------
let vcapLocal;
try {
    vcapLocal = require('../vcap-local.json.js'); //import json data
    console.log("Loaded local VCAP", vcapLocal);
} catch (e) { 
    console.error("If you are running this application locally, you might forgot to rename the `vcap-local.json.example` file.") 
}
const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {} //check if vcapLocal is undefined or null
const appEnv = cfenv.getAppEnv(appEnvOpts); //create CloudFoundry App Enviroment from vcapLocal

const cloudantDefaultDb = process.env.CLOUDANT_DB || "mydb"; //define default cloudant database
const cloudant = new CloudantClient(cloudantDefaultDb, appEnv) //create new CloudantClient instance -> executes its init() function

//------------------------------------------------------------------------------
// Make appEnv, the cloudant client and the defined database public accessable
//------------------------------------------------------------------------------
module.exports = {
    cloudantClient: cloudant,
    cloudantDefaultDb: cloudantDefaultDb,
    appEnv: appEnv,
}