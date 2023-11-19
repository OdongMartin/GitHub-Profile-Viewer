const express = require('express');
const router = express.Router();
const https = require('https');

router.get('/github/userinfo/:user', async function(req, res) {
    const user = req.params.user;
    const options = {
        hostname: 'api.github.com',
        path: '/users/'+ user,
        headers: {
            'User-Agent': 'OdongMartin', //'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1521.3 Safari/537.36'
        },
        OAuth: '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',
    }
    https.get(options, function(apiResponse) {
        apiResponse.pipe(res);
    }).on('error', function(err){
        console.log(err);
        res.status(500).send('error');
    })
});

module.exports = router;