var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HistorySchema = new Schema({
	state: {type: String, required: false},
	disaster_type: {type: String, required: false},
	date_from: {type:Date},
	date_to: {type:Date},
	// location: {type: [Number], required: true}, //[Long, Lat]
	created_at: {type: Date, default: Date.now}
});

HistorySchema.pre('save', function(next){
	now = new Date();
	if(!this.created_at){
		this.created_at = now
	}

	next();
});

// HistorySchema.index({location: '2dsphere'});

//Exports the HistorySchema to make available throughout the application
module.exports = mongoose.model('query_history', HistorySchema);