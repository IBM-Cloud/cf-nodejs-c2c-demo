const express = require('express');

const router = express.Router();

//------------------------------------------------------------------------------
// ROUTE: /api
// Simple API Route to check if the server is still available.
//------------------------------------------------------------------------------
router.get('/', (req, resp) => {
    resp.status(200).json({"status": "UP"}); //output: {status: "UP"}
});

module.exports = router;