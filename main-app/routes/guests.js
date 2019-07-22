const express = require('express');
const dbClients = require('../services/service');
const uuidv4 = require('uuidv4');
const axios = require('axios');

const router = express.Router();

//------------------------------------------------------------------------------
// ROUTE: /api/guests
// API Route for listing all guests from the database. Creates an array of objects
// with the necessary information (like userName, tags, id and fileName) to display 
// the guest cards in the frontend.
//------------------------------------------------------------------------------
router.get('/', (req, resp) => {

    const cloudant = dbClients.cloudantClient; //get preinitialized cloudant client
    let guestArray = []; //define return array

    //get all documents (/rows) from database using custom client
    cloudant.getAll().then((body) => {
        body.rows.forEach((row) => { //loop through rows
            let guest = {};
            let doc = row.doc; //get document of row

            //------------------------------------------------------------------------------
            // Copy needed data to the custom guest object
            //------------------------------------------------------------------------------
            guest.id = doc._id; //copy id (necessary for attachment route)
            if(doc.userName) guest.userName = doc.userName;
            if(doc.tags) guest.tags = doc.tags;
            if(doc._attachments){ //_attachments contains meta data to the attachments like name and size

                //------------------------------------------------------------------------------
                // For the case multiple attachments were accidentely uploaded for one doc,
                // loop through all attachments of this document and take the last image as picture.
                //------------------------------------------------------------------------------
                let fileName;
                Object.keys(doc._attachments).forEach((key) => {
                    if(/\.(jpe?g|png|gif)$/i.test(key)) { //check if image
                        fileName = key;
                    }
                });
                if(fileName && fileName !== ""){ //if at least one image was found
                    guest.fileName = fileName; //set as guest image
                }
            }
            guestArray.push(guest); //at to return array
        });

        resp.json(guestArray); //http response

    }).catch((err) => {
        console.error(err);
        resp.status(500).send(err);
    })
});

//------------------------------------------------------------------------------
// ROUTE: /api/guests
// API Route for adding a new guest. This includes the saving of user name and
// attachment, the remote analysis of the image (service 2) and saving of the tags.
// It is implemented as chain of promises.
//------------------------------------------------------------------------------
router.post('/', (req, resp) => {

    const cloudant = dbClients.cloudantClient; //get preinitialized cloudant client

    //get values from request body (payload)
    let userName = req.body.userName;
    let photoUrl = req.body.photoUrl;

    //------------------------------------------------------------------------------
    // Split the data url into its parts (last item is the base64 string), part of
    // the first item is the mime type (jp(e)g, png or gif).
    //------------------------------------------------------------------------------
    let photoUrlParts = photoUrl.split(';base64,');
    let base64Image = photoUrlParts.pop();
    let mimeType = photoUrlParts[0].split(':')[1].split('/')[1]; // example: data:image/jpeg

    let doc = { "userName": userName }; //define return object

    //------------------------------------------------------------------------------
    // Create buffer and unique file name for upload to database.
    //------------------------------------------------------------------------------
    let file = Buffer.from(base64Image, 'base64');
    let fileName = uuidv4() + "." + mimeType;

    //------------------------------------------------------------------------------
    // Insert basic document (return object) with the inputed user name and upload image as attachment.
    //------------------------------------------------------------------------------
    cloudant.multiInsert(uuidv4(), file, fileName, mimeType, doc)
    .then((insertResp) => {

        // response only includes id and rev 
        // -> use id (rev is dynamic) and save previously generated filename
        doc.id = insertResp.id;
        doc.fileName = fileName;
        return; //go to next "then"

    //------------------------------------------------------------------------------
    // Send http request to service 2 for analysing of the image and gathering of the tags.
    //
    // WATSON_IMAGE_URL: Address of this service (1) to call the attachment route.
    // WATSON_SERVICE_URL: Address of service 2.
    //------------------------------------------------------------------------------
    }).then(() => {

        //get service addresses from enviromental variables or use placeholders if not defined
        let watsonImageUrl = process.env.WATSON_IMAGE_URL || "";
        let watsonServiceUrl = process.env.WATSON_SERVICE_URL || "http://localhost:3000"

        //prepares the link to the image using document id and file name
        let imageUrl = `${watsonImageUrl}/api/attachment/${doc.id}/${doc.fileName}`;

        //sends request to service 2 with the imageUrl as payload
        return axios.post(`${watsonServiceUrl}/api/image`, {imageUrl: imageUrl});

    //------------------------------------------------------------------------------
    // Copy tags and additional tagData to the return object, get the complete document
    // from Cloundant to update it in the next step.
    //------------------------------------------------------------------------------
    }).then((httpResp) => {

        //get tags from the http response from service 2
        let tags = httpResp.data.tags;
        let tagData = httpResp.data.data;

        //populate return object
        doc.tags = tags;
        doc.tagData = tagData;

        //get document (guest data) by id from database
        return cloudant.get(doc.id);

    //------------------------------------------------------------------------------
    // Update the tags and tagData on the database document.
    //------------------------------------------------------------------------------
    }).then((dbDoc) => {

        // update from database retrieved object with the tag fields
        // -> return object (doc) was updated in last step
        dbDoc.tags = doc.tags;
        dbDoc.tagData = doc.tagData;

        //update (insert updated) document in the database
        return cloudant.update(doc.id, dbDoc);

    //------------------------------------------------------------------------------
    // Receive successful response from database update and write the latest rev
    // value into the return object. Subsequently, send successful http response to
    // to user.
    //------------------------------------------------------------------------------
    }).then((updatedDoc) => {

        doc.rev = updatedDoc.rev;
        resp.json(doc); //send successful response with return document to user

    //------------------------------------------------------------------------------
    // If one of the steps above fails or triggers an error, the execution jumps
    // into catch. It logs the error for the administrator and return to the user
    // the return document at this point of time when the error occured.
    //------------------------------------------------------------------------------
    }).catch((err) => {

        console.log(err);
        resp.json(doc); //send doc back to user

    });
});

module.exports = router;