module.exports = function(mongoose) {
	var util = require('util')
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	function BaseExerciseSchema() {
		Schema.apply(this, arguments);

		this.add({
			name: String,
			type: String,
			id: String
		});
	}

	util.inherits(BaseExerciseSchema, Schema);

	var workout_schema = new Schema({
		date: { type: Date, default: Date.now},
		user: String,
		exercises: [{}]
		//
	});

	var resistance_exercise = new BaseExerciseSchema({sets: [{weight: Number, reps: Number, unit: String}]})
	var cardio_exercise = new BaseExerciseSchema({time: Number, distance: Number, distance_unit: String})
	var CX = mongoose.model('CX', cardio_exercise);
	var RX = mongoose.model('RX', resistance_exercise);
	var Workout = mongoose.model('Workout', workout_schema);
	
	var save = function(message, cb) {
		var workout = message.workout;
		workout.exercises.forEach(function(e) {
			if (e.type === 'weight/reps') {
				e = RX(e);
			} 
			else if (e.type === 'distance/time') {
				e = CX(e);
			}
		})
		workout = Workout(workout);
		workout.save(function(err, saved) {
			console.log(err)
			console.log('SAVED\n', JSON.stringify(saved, null, 2))
			cb(err, saved)
		})
	}

	var history = function(message, cb) {
		Workout.find({user: message.user}, function(err, data) {
			cb(err, data)
		})
	}

	return {
		save: save,
		history: history
	}
}