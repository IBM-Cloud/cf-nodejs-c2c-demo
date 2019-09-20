const express = require('express');
const dbClients = require('../services/service');

const router = express.Router();

//------------------------------------------------------------------------------
// ROUTE: /api/attachment/<document id>/<file name>
// API Route that returns an attachment from Cloudant via a File Stream.
// It searches the file using the id of the connected document and the attachments
// file name and pipes the file stream directly to the http response.
// The reason for this route is that Cloudant doesn't provide public links to files
// but rather requires basic authentification, which can't be included in Browser Links.
// Hence, this route is a bridge between the outside and the database.
//------------------------------------------------------------------------------
router.get('/:id/:filename', (req, resp) => {
    //get url parameters
    let id = req.params.id;
    let filename = req.params.filename;

    const cloudant = dbClients.cloudantClient; //get predefined client
    cloudant.getAttachmentAsStream(id, filename).pipe(resp) //get attachment stream and forward it to the user
});

module.exports = router;