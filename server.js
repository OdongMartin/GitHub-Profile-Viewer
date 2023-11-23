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
    res.render('login');
});
app.post('/login', function(req, res){
    //
});

app.get('/signup', function(req, res){
    res.render('signup');
});
app.post('/signup', function(req, res){
    //
});

app.use('/api', api);
app.get('/', function(req, res) {
    console.log(userInfo);
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