module.exports = function(mongoose) {

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
		type: String,
		owner: {type: String}
	});


	//save a category or a tag if it doesn't exist and push the new exercise to its list
	var save_category_or_tag = function(model_name, model_schema, exercise, callback) {
		model_schema.findOne({name: model_name}, function(err, model) {
			if (err) { return cb(err); }
			if (!model) {
				model = model_schema({name: model_name});
				console.log('CREATING', model);
			}
			if (exercise) { model.exercises.push(exercise); }
			model.save(function(err, saved) {
				callback(err, saved);
			})
		})
	}

	var save = function(message, cb) {
		var x = Exercise_Def(message.exercise);
		console.log('SAVE EXERCISE', x)
		x.save(function(err, x) {
			if (err) { return cb(err); }
			else {
				console.log('exercise created');
				save_category_or_tag(x.category, Category, x, function(err, saved) {
					if (err) { return cb(err); }
					x.tags.forEach(function(tag) {
						save_category_or_tag(tag, Tag, x, function(err, saved) {
							if (err) { return cb(err); }
						})
					});
					cb(null, x);
				})
			}
		})
	}

	var read_exercises = function(message, cb) {
		Exercise_Def.find(function(err, x) {
			cb(err, x);
		});
	}

	var remove = function(message, cb) {
		var x = message.exercise;
		Exercise_Def.remove(x.id, function(err) {
			if (err) { return cb(err); }
			else {
				cb(null, 'exercise removed');
			}
		});
	}

	Category = mongoose.model('Category', category_schema);
	Tag = mongoose.model('Tag', tag_schema);
	Exercise_Def = mongoose.model('Exercise Definition', exercise_definition_schema);

	return {
		create: Exercise_Def,
		read_exercises: read_exercises,
		save: save,
		remove: remove
	}
}

