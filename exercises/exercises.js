var mongoose = require('mongoose');
var models = require('./exercise');
mongoose.connect('mongodb://localhost:27017/progress');

var Category = models.Category;
var Exercise_Def = models.Exercise_Def;
var Tag = models.Tag;

// var save_exercise_def = function(x, cb) {

// 	Category.findOne({category: x.category}, function(err, c) {
// 		if (err) {cb(err)}
// 		if (!c) {
// 			console.log('category', x.category, 'does not exist...\n')
// 			c = Category({category: x.category});
// 		}
// 		c.exercises.push(x);
// 		c.save(function(err, c) {
// 			if (err) { return cb(err) }
// 			console.log('SAVED CATEGORY\n', c);

// 			x.tags.forEach(function(t, index) {
// 				Tag.findOne({tag: t}, function(err, tag) {
// 					if (err) { return cb(err)}
// 					if (!tag) {
// 						console.log('Tag', t, 'does not exist...\n')
// 						tag = Tag({tag: t});
// 					}
// 					tag.exercises.push(x);
// 					tag.save(function(err, t) {
// 						if (err) { cb(err) }
// 						console.log('SAVED TAG\n', t);
// 					})

// 					if (index === x.tags.length-1) {
// 						x.save(function(err, x) {
// 							cb(err, x)
// 						})
// 					}
// 				});
// 			});
// 		})
// 	});
// }

var save_exercise_def1 = function(x, cb) {
	models.save_category_or_tag(x.category, Category, x, function(err, saved) {
		if (err) { return cb(err); }
		console.log('CREATED', saved);
		x.tags.forEach(function(tag) {
			models.save_category_or_tag(tag, Tag, x, function(err, saved) {
				if (err) { return cb(err); }
				console.log('CREATED', saved);
			})
		})
		x.save(function(err, saved) {
			if (err) {return cb(err); }
			cb(err, saved)
		})
	});
}

var e0 = Exercise_Def({name: 'pushup', tags: ['Chest', 'Arms'], category: 'Body Weight', measurements: [{measure: 'reps', unit: 'reps'}, {measure: 'weight', unit: 'lbs'}]})

Category.find({name: 'Body Weight'}).populate('exercises').exec(function(err, c) {
	console.log(err)
	console.log(c)
})

// save_exercise_def1(e0, function(err, saved) {
// 	console.log('------------------------------------------------------------------------');
// 	console.log(saved)
// 	console.log('------------------------------------------------------------------------');
// })