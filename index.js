'use strict';

var express = require('express');
var app = express();
var mongoose = require('mongoose');

var port = process.env.PORT || 3000

var mongoDB = 'mongodb://127.0.0.1/us-disaster-report';
mongoose.connect(mongoDB);

mongoose.Promise = global.Promise;

var db = mongoose.connection;

db.on('error', console.error.bind(console, "MongoDB Connection error:"));

app.listen(port, function(){
  console.log("Server starting on 3000!");
});

app.get("/", (req, res) => {
 	db.collection('fema-dataset').find().toArray(function(err, results){
 		console.log(results);
 	});
});