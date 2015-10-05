var mongoose = require('mongoose')
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;
var async = require('async')

var category_schema = new Schema({
	name: {type: String, required: true, enum: ['Resistance Training', 'Body Weight', 'Cardio'], unique: true},
	exercises: [{type: Schema.Types.ObjectId, ref: 'Exercise Definition'}]
})

var tag_schema = new Schema({
	name: {type: String, required: true, unique: true},
	exercises: [{type: Schema.Types.ObjectId, ref: 'Exercise Definition'}]
});

//these are the exercise definitions
//not actual exercises logged by a user

var exercise_definition_schema = new Schema({
	name: String,
	category: String,
	tags: [String],
	measurements: [{ measure: String, unit: String }]
});


//save a category or a tag if it doesn't exist and push the new exercise to its list
exports.save_category_or_tag = function(model_name, model_schema, exercise, callback) {
	model_schema.findOne({name: model_name}, function(err, model) {
		if (err) { return cb(err); }
		if (!model) {
			model = model_schema({name: model_name});
		}
		model.exercises.push(exercise);
		model.save(function(err, saved) {
			callback(err, saved);
		})
	})
}

//creation of exercise def is as follows:
//receive object like this: {name: 'pushup', category: 'Body Weight', tags, ['Arms', 'Chest'], 
// 														measurements: [{measure: 'reps', unit: 'reps'}, {measure: 'weight', unit: 'lbs'}]}
//create the thing
//push a reference to it to the category, create a new category if it doesn't exist and then push
// for each tag ->
// Create the tag if not exists, push exercise ref to the tag

exports.Category = mongoose.model('Category', category_schema);
exports.Tag = mongoose.model('Tag', tag_schema);
exports.Exercise_Def = mongoose.model('Exercise Definition', exercise_definition_schema);