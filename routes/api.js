const express = require('express');
const router = express.Router();
const https = require('https');

require('dotenv').config();
const apiKey = process.env.APIKEY;

router.get('/', function(req, res) {
    res.render('layout');
})

router.post('/', async function(req, res) {
    // Check if the username only contains lowercase letters and no spaces
    if (!/^[a-zA-Z0-9]+$/.test(req.body.username) || req.body.username.includes(' ')) {
        return res.render('layout', { message: 'Invalid username format' });
    }
    const options = {
        hostname: 'api.github.com',
        path: '/users/'+ req.body.username,
        headers: {
            'User-Agent': 'OdongMartin',
            'Authorization': `Bearer ${apiKey}`,
        },
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
                    email : userData.email,
                    location : userData.location,                    
                    private : userData.total_private_repos, 
                    public : userData.public_repos, 
                    followers : userData.followers, 
                    following : userData.following, 
                    joined : userData.created_at,
                    twitter: userData.twitter_username,
                });

                console.log(userData);
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

/*router.get('/github/userinfo/:user', async function(req, res) {
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
});*/

router.post('/reposinfo/:user', async function(req, res) {
    const user = req.params.user;
    const options = {
        hostname: 'api.github.com',
        path: '/users/'+ user + '/repos',
        headers: {
            'User-Agent': 'OdongMartin',
            'Authorization': `Bearer ${apiKey}`,
        },
    }
    https.get(options, function(apiResponse) {
        let rawData = '';
        
        apiResponse.on('data', function(chunk) {
            rawData += chunk;
        });

        apiResponse.on('end', function() {
            try {
                const reposData = JSON.parse(rawData);
                res.render('repos_info', {repos : reposData});
                //console.log(reposData);

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