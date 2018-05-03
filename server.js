'use strict';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var MapData = require('./views/js/mapdata.js')
var port = process.env.PORT || 3000


//Connection to MongoDB
var mongoDB = 'mongodb://127.0.0.1/us-disaster-report';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;

db.on('error', console.error.bind(console, "MongoDB Connection error:"));


// Logging and Parsing
// app.set('view engine', 'ejs');
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

app.get("/", (req, res) => {
 	db.collection('fema-dataset').find().toArray(function(err, results){
 		if (err) return console.log(err)
	    // renders index.ejs
		var mod_results = [];
		for (var i = 0; i < results.length; i++) {
			if(results[i].incidentType == "Tornado" && results[i].state=="IN"){
				MapData.initMap().addMarker({coords:{lat:40.2672, lng:-86.1349},icon:'https://www.flaticon.com/free-icon/tornado_189177#term=tornado&page=1&position=17', content:'<h1>Tornado data</h1>'})
				mod_results.push(results[i]);
			}
		}

	    res.render('index.ejs', {fema_dataset: mod_results})
 	});
});