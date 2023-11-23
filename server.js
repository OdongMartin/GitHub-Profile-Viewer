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

app.get('/login', function(req, res){
    userInfo.find().then(function(user){console.log(user)});
    res.render('login');
});
app.post('/login', function(req, res){
    // still needs improving first work on signup
    userInfo.findOne({ 
        username: req.body.username,
        password : req.body.password
    }).then(function(user){
        console.log('logged in');
    }).catch(function(err){
        console.log(err);
    });
});

app.get('/signup', function(req, res){
    console.log(userInfo.username + " : " + userInfo.password);
    res.render('signup');
});
app.post('/signup', function(req, res){
    if (!/^[a-zA-Z0-9]+$/.test(req.body.id) || req.body.id.includes(' ')) {
        return res.render('signup', { message: 'Invalid username format' });
    }

    userInfo.findOne({username : req.body.id
    })
        .then(function(user){
            if(user){
                res.render('signup', {message : "Username Already Exists"});
            }
            else if (!user) {
                if (req.body.password === req.body.confirmPassword){
                    var newUser = new userInfo ({
                        username : req.body.id.toLowerCase(),
                        password : req.body.password
                    });

                    req.session.user = newUser;

                    newUser.save()
                        .then(function(){
                            res.redirect('/login');
                        })
                        .catch(function(error){
                            console.log(error);
                        })

                }
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