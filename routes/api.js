const express = require('express');
const router = express.Router();
const https = require('https');
//const {checkLoggedIn, checkSignIn} = require('../server');

require('dotenv').config();
const apiKey = process.env.APIKEY;

// Cache to store previously fetched user profiles
const profileCache = {};

// Search history array
const searchHistory = [];

router.get('/documentation', function(req, res){
    res.render('documentation', { searchHistory,  loggedIn: req.isAuthenticated()});
})

router.get('/feedback', function(req, res){
    res.render('feedback', { searchHistory,  loggedIn: req.isAuthenticated()});
})

router.get('/', function(req, res) {
    res.render('layout', { searchHistory, loggedIn: req.isAuthenticated()});
})

router.post('/', function(req, res) {
    // Check if the username only contains lowercase letters and no spaces
    if (!/^[a-zA-Z0-9]+$/.test(req.body.username) || req.body.username.includes(' ')) {
        return res.render('layout', { message: 'Invalid username format' , loggedIn: req.isAuthenticated()});
    }

    if (profileCache[req.body.username]) {
        console.log(`Using cache data for ${req.body.username}`);
        updateSearchHistory(req.body.username);
        renderUserInfo(res, req, profileCache[req.body.username]);
    } else {
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
                    console.log(userData);
                    // Cache te data
                    profileCache[req.body.username] = userData;
                    updateSearchHistory(req.body.username);
                    renderUserInfo(res, req, userData);
                    //console.log(userData);
                } catch (e) {
                    console.error(e.message);
                    res.status(500).send('Error processing GitHub API response');
                }
            });
        }).on('error', function(err) {
            console.error(err);
            res.status(500).send('Error communicating with GitHub API');
        });
    }
    
});

router.post('/repos/:user', async function(req, res) {
    const user = req.params.user;

    if (profileCache[user]) {
        console.log(`Using cached data for repositories of ${user}`);
        updateSearchHistory(user);
        renderReposInfo(res, req, profileCache[user]);
    } else {
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
                console.log(rawData);
            });

    
            apiResponse.on('end', function() {
                try {
                    const reposData = JSON.parse(rawData);
                    // Cache the data
                    profileCache[user] = reposData;
                    updateSearchHistory(user);
                    renderReposInfo(res, req, reposData);
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
    }
    
});

function renderUserInfo(res, req, userData) {
    res.render('user_info', {
        avatar: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        bio: userData.bio,
        email: userData.email,
        location: userData.location,
        private: userData.total_private_repos,
        public: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        joined: userData.created_at,
        twitter: userData.twitter_username,
        searchHistory,
        loggedIn: req.isAuthenticated(),
    });
}

function renderReposInfo(res, req, reposData) {
    //console.log(reposData);
    res.render('repos_info', { repos: reposData, searchHistory, loggedIn: req.isAuthenticated()});
}

function updateSearchHistory(username) {
    // Add the username to the search history
    if (!searchHistory.includes(username)) {
        searchHistory.push(username);
    }
    //console.log(searchHistory);
}

//middle ware to be used later
/*function checkSignIn(req, res, next){
    //check if session exists
    if(req.isAuthenticated()){
       return next();    
    } else {
       res.redirect('/login'); 
    }
}
function checkLoggedIn(req, res, next){
    if (req.isAuthenticated()) { 
        return res.redirect("/api");
    }
   next();
}*/

module.exports = router;