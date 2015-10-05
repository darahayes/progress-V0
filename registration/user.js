module.exports = function(mongoose) {
	var Schema = mongoose.Schema
	  , ObjectId = Schema.ObjectId;

	var User = new Schema({
		name: String,
		age: Number,
		gender: String
	});

	return mongoose.model('User', User);
}