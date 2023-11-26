require('dotenv').config();
const PORT = process.env.PORT || 3000;

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//form data things and using url to fetch data
const multer = require('multer');
const upload = multer();
app.use(upload.array()); 
app.use(bodyParser.urlencoded({extended : true}));

app.use(express.static('public'));

const api = require('./routes/api.js');

const cors = require('cors');

const bcrypt = require('bcrypt');

//express-session
const session = require('express-session');
app.use(session({
    secret: "12345678987654321",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // Session expiration time
}));

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1/my_db');
var userDetails = mongoose.Schema({
    username: String,
    //email: String,
    password: String,
});

var userInfo = mongoose.model('userInfo', userDetails);

app.set('views', 'views');
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(cors());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

//authentication using passportjs
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Initializing Passport.js
app.use(passport.initialize());
app.use(passport.session());

/*passport.use(
    new LocalStrategy(function(username, password, done) {
        userInfo.findOne({ 
            username: username,
            password : password
        }).then(function(user){
            if(!user){
                return done(null, false, { message: 'Incorrect username' });
            }
            if(user){
                return done(null, user);
            }
        }).catch(function(err){
            console.log(err);
            return done(err);
        });
    })
);*/
passport.use(
    new LocalStrategy(function(username, password, done) {
        userInfo.findOne({ 
            username: username,
        }).then(function(user){
            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }
            
            if (!user.password) {
                return done(null, false, { message: 'Incorrect password' });
            }

            // Check the password
            bcrypt.compare(password, user.password, function(err, result) {
                if (err || !result) {
                    return done(null, false, { message: 'Incorrect password' });
                }

                // Passwords match, return the user
                return done(null, user);
            });
        }).catch(function(err){
            console.log(err);
            return done(err);
        });
    })
);

passport.serializeUser(function(userObj, done) {
    done(null, userObj); // Serialize user ID into the session
  });
  
passport.deserializeUser(function(userObj, done) {
    // Retrieve the user from the database based on the iD
    userInfo.findOne(userObj)
        .then(function(user){
            done(null, user);
        })
        .catch(function(err){
            return done(err);
    })

});

//middle ware to be used later
/*function checkSignIn(req, res, next){
    //check if session exists
    if(req.isAuthenticated()){
       return next();    
    } else {
       res.redirect('/login'); 
    }
}*/
function checkLoggedIn(req, res, next){
    if (req.isAuthenticated()) { 
        return res.redirect("/api");
    }
   next();
}

/*module.exports = {
    checkLoggedIn,
    checkSignIn,
};*/


//note: this deletes entire database
/*app.get('/delete', function(req, res) {
    userInfo.deleteMany({})
    .then(function(user) {
        console.log ("removed all data");
    })
    .catch(function(err) {
        console.error("Error removing data:", err);
        res.status(500).send("Internal Server Error");
    });
});*/

app.get('/login', checkLoggedIn, function(req, res){
    userInfo.find().then(function(user){console.log(user)});
    res.render('login');
});
app.post('/login', function(req, res, next){
    passport.authenticate('local',  function(err, user, info) {
        //console.log("user password is " + user.password);
        //console.log("req password is " + req.body.password);
        if (err) {
            return next(err);
        }
        //if (!user || !user.password) {
        //    return res.render('login', {message : "Enter correct details or just sign up"});
        //}

        bcrypt.compare(req.body.password, user.password, function(err, result) {

            console.log(result);
            if (err || !result) {
                return res.render('login', { message: 'Enter correct details or just sign up' });
            }
            
            else{
                //manually establishing user sesssion
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect('/api');
                });
            }

        });

    })(req, res, next);
});

/*app.post('/login',
passport.authenticate('local', {
    successRedirect: '/api',
    failureRedirect: '/login',
})
);*/

//logout
app.get('/logout', function(req, res){
    req.session.destroy(function(err) {
        // Destroy the session
        res.redirect('/login');
    });
});

app.get('/signup', function(req, res){
    res.render('signup');
});
app.post('/signup', function(req, res){
    if (!/^[a-zA-Z0-9]+$/.test(req.body.id) || req.body.id.includes(' ')) {
        return res.render('signup', { message: 'Invalid username format' });
    }

    userInfo.findOne({username : req.body.id})
        .then(function(user){
            if(user){
                res.render('signup', {message : "Username Already Exists"});
            }
            else {
                bcrypt.hash(req.body.password, 10, function(err, hash) {
                    if (err) {
                        console.log(err);
                        return res.render('signup', { message: 'Error hashing password' });
                    }

                    if (req.body.password === req.body.confirmPassword){
                        var newUser = new userInfo ({
                            username : req.body.id.toLowerCase(),
                            password : hash
                        });

                        req.session.user = newUser;

                        newUser.save()
                            .then(function(){
                                res.redirect('/login');
                            })
                            .catch(function(error){
                                console.log(error);
                            });
                    }
                });
            
            }
        })
        .catch(function(err){
            console.log(err);
    });
});


    /*userInfo.findOne({username : req.body.id}, function (err, existingUser){
        if (err) {
            res.render('signup', {message : "Database Error"});
        }
        else if (existingUser) {
            res.render('signup', {message : "Username Already Exists"});
        }
        else {
            if (req.body.password === req.body.confirmPassword){
                var newUser = new userInfo ({
                    username : req.body.id.toLowerCase(),
                    password : req.body.password
                });

                req.session.user = newUser;

                newUser.save(function(err, userInfo) {
                    if(err){
                        res.send("error saving user to database");
                    }
                    else {
                        res.redirect('/login');
                    }
                });
            }

            else {
                res.render('signup', {message : "Confirm with same password"});
            }
        }
    })
});*/

app.use('/api', api);
app.get('/', function(req, res) {
    res.redirect('/api');
});

app.get('/manifest.json', function(req, res) {
    res.sendFile('public', 'manifest.json');
});
  
app.get('/service-worker.js', function(req, res) {
    res.sendFile('public', 'service-worker.js');
});


app.listen(PORT, function() {
    console.log(`listening on port ${PORT}`);
})