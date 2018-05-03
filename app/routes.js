var mongoose = require('mongoose');
var History = require('./model.js');

module.exports = function(app) {

	app.get('/history', function(req, res){

		var query = History.find({});
		query.exec(function(err, history){
			if(err){
				res.send(err);
			}
			res.json(history);
		});
	});

	app.post('/history', function(req, res){

		var newquery = new History(req.body);

		newquery.save(function(err){
			if(err){
				res.send(err);
			}
			res.json(req.body);
		});
	});
};