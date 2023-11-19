const express = require('express');
const router = express.Router();
const https = require('https');

require('dotenv').config();
const apiKey = process.env.APIKEY;

router.get('/github/userinfo/:user', async function(req, res) {
    const user = req.params.user;
    const options = {
        hostname: 'api.github.com',
        path: '/users/'+ user,
        headers: {
            'User-Agent': 'OdongMartin',
        },
        OAuth: apiKey,
    }
    https.get(options, function(apiResponse) {
        apiResponse.pipe(res);
    }).on('error', function(err){
        console.log(err);
        res.status(500).send('error');
    })
});

module.exports = router;