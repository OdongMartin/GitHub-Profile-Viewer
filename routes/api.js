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
            'Authorization': `Bearer ${apiKey}`,
        },
        //OAuth: apiKey,
    }
    https.get(options, function(apiResponse) {
        let rawData = '';
        
        apiResponse.on('data', function(chunk) {
            rawData += chunk;
        });

        apiResponse.on('end', function() {
            try {
                const userData = JSON.parse(rawData);
                res.render('user_info', {
                    avatar : userData.avatar_url, 
                    name : userData.name, 
                    username : userData.login, 
                    bio : userData.bio, 
                    private : userData.total_private_repos, 
                    public : userData.public_repos, 
                    followers : userData.followers, 
                    following : userData.following, 
                    joined : userData.created_at
                });
            } catch (e) {
                console.error(e.message);
                res.status(500).send('Error processing GitHub API response');
            }
        });
    }).on('error', function(err) {
        console.error(err);
        res.status(500).send('Error communicating with GitHub API');
    });
});

router.get('/github/reposinfo/:user', async function(req, res) {
    const user = req.params.user;
    const options = {
        hostname: 'api.github.com',
        path: '/users/'+ user + '/repos',
        headers: {
            'User-Agent': 'OdongMartin',
            'Authorization': `Bearer ${apiKey}`,
        },
        //OAuth: apiKey,
    }
    https.get(options, function(apiResponse) {
        let rawData = '';
        
        apiResponse.on('data', function(chunk) {
            rawData += chunk;
        });

        apiResponse.on('end', function() {
            try {
                const reposData = JSON.parse(rawData);
                //res.send(reposData);
                //console.log(reposData.length);

                res.render('repos_info', {repos : reposData});

            } catch (e) {
                console.error(e.message);
                res.status(500).send('Error processing GitHub API response');
            }
        });
    }).on('error', function(err) {
        console.error(err);
        res.status(500).send('Error communicating with GitHub API');
    });
});


module.exports = router;