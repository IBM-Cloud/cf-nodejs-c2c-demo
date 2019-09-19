const cfenv = require('cfenv');
const WatsonClient = require('./watson'); //import WatsonClient class

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

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}; //check if vcapLocal is undefined or null
const appEnv = cfenv.getAppEnv(appEnvOpts); //create CloudFoundry App Enviroment from vcapLocal

const watsonClient = new WatsonClient(appEnv); //create new WatsonClient instance -> executes its init() function

//------------------------------------------------------------------------------
// Make appEnv and watsonClient via export public
//------------------------------------------------------------------------------
module.exports = {
    appEnv: appEnv,
    watsonClient: watsonClient,
}