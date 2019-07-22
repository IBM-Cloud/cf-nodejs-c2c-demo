//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
require('./services/service'); //executes the module code to initialize the CloudFoundry services

//------------------------------------------------------------------------------
// Define app and port
//------------------------------------------------------------------------------
const app = express();
const port = process.env.PORT || 5000; //get port from enviroment variables or use port 5000 if not defined

//------------------------------------------------------------------------------
// Import all routes
//------------------------------------------------------------------------------
const healthRoute = require('./routes/health');
const guestRoutes = require('./routes/guests');
const attachmentRoutes = require('./routes/attachment');

//------------------------------------------------------------------------------
// Use middleware
//------------------------------------------------------------------------------
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({limit: '50mb'}))
app.use(cors({origin: '*'})); //Allow cross-origin (for requests from outside the container networking)

//------------------------------------------------------------------------------
// Initialize routes
//------------------------------------------------------------------------------
app.use('/api', healthRoute);
app.use('/api/guests', guestRoutes);
app.use('/api/attachment', attachmentRoutes);

//------------------------------------------------------------------------------
// Initialize static-served files (user interface)
//------------------------------------------------------------------------------
app.use(express.static(__dirname + '/views'));

// Overview about the enviroment vaiables
console.log("[ENV] Server Port: " + (process.env.PORT || ""));
console.log("[ENV] Image Base Path: " + (process.env.WATSON_IMAGE_URL || ""));
console.log("[ENV] Watson Microservice: " + (process.env.WATSON_SERVICE_URL || ""));

//------------------------------------------------------------------------------
// Start http server
//------------------------------------------------------------------------------
//if not defined as enviroment variable, the port on localhost is 5000
app.listen(port, () => console.log(`Listening on port: ${port}`))