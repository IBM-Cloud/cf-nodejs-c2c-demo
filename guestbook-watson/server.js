//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
require('./services/service'); //executes the module code to initialize the watson functions

//------------------------------------------------------------------------------
// Define app and port
//------------------------------------------------------------------------------
const app = express();
const port = process.env.PORT || 3000; //get port from enviroment variables or use port 3000 if not defined

//------------------------------------------------------------------------------
// Import all routes
//------------------------------------------------------------------------------
const healthRoute = require('./routes/health');
const imageRoutes = require('./routes/image');

//------------------------------------------------------------------------------
// Use middleware
//------------------------------------------------------------------------------
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors({origin: '*'})); //Allow cross-origin (for requests from outside the container networking)

//------------------------------------------------------------------------------
// Initialize routes
//------------------------------------------------------------------------------
app.use('/api', healthRoute);
app.use('/api/image', imageRoutes);

// Overview about the enviroment vaiables
console.log("[ENV] Server Port: " + (process.env.PORT || "3000"));

//------------------------------------------------------------------------------
// Start http server
//------------------------------------------------------------------------------
//if not defined as enviroment variable, the port on localhost is 3000
app.listen(port, () => console.log(`Listening on port: ${port}, Link: http://localhost:${port}`));