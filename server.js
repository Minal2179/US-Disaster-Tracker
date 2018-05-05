'use strict';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
//var MapData = require('./views/js/mapdata.js')
var port = process.env.PORT || 3000


//Connection to MongoDB
var mongoDB = 'mongodb://heroku_46p66m93:m23gdj0iol6uuer4pcvn0k2ooh@ds115340.mlab.com:15340/heroku_46p66m93';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;

db.on('error', console.error.bind(console, "MongoDB Connection error:"));


// Logging and Parsing
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));
app.use(methodOverride());
app.use(express.static('views'));

//Routes
require('./app/routes.js')(app);

//Server Listen
app.listen(port, function(){
  console.log("Server starting on 3000!");
});

