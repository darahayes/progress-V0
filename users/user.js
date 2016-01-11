module.exports = function(mongoose) {

	var _ = require('lodash');
	var crypto = require('crypto');
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var user_schema = new Schema({
		email: {type: String, required: true, unique: true},
		name: String,
		age: Number,
		gender: String,
		password: {type: String, select: false},
		salt: {type: String, select: false}
	});

	user_schema.pre('save', function(next) {
		if (this.isNew) {
			var user = this
			user.salt = crypto.randomBytes(64).toString('hex');
			get_hash(user.password, user.salt, function(err, key) {
				if (err) { return next(err); }
				user.password = key;
				next();
			});
		}
		next();
	});

	//users are allowed to modfy these fields only
	user_schema.updatable = ['name', 'age', 'gender'];

	var User = mongoose.model('User', user_schema);

	function createUser(message, cb) {
		console.log('create user called');
		var user = User(message.user);
		console.log(user);
		user.save(function(err, user) {
			if (err) {
				if (err.code === 11000 || err.code === 11001) {
					return (cb(null, {warn: 'A user already exists with that email address'}))
				}
			}
			console.log('save')
			if (err) { console.log(err); cb(err); }
			console.log('User Created!');
			cb(null, _.omit(user.toObject(), 'password', 'salt'));
		})
	}

	function updateUser(message, cb) {
		console.log('update user called');
		User.findById(message.user._id, function(err, user) {
			if (err) {cb(err)}
			user_schema.updatable.forEach(function(field) {
				if (message.user[field]) { user[field] = message.user[field]; }
			});
			user.save(function(err, user) {
				console.log(err);
				if(err) {cb(err)}
				console.log('User Updated');
				cb(null, user);
			})
		});
	}

	function deleteUser(message, cb) {
		console.log('delete user called');
		User.remove(message.user.id, function(err) {
			if (!err) { console.log('User Removed'); }
		})
	}

	function findById(message, cb) {
		console.log('findById');
		User.findById(message.user.id, function(err, user) {
			if (err) {cb(err)}
			cb(null, user);
		});
	}

	function findByEmail(message, cb) {
		User.findOne({email: message.user.email}, function(err, user) {
			if (err) { cb(err); }
			cb(null, user);
		});
	}

	function get_hash(password, salt, cb) {
		//pw, salt, iterations, keylength, cipher
		crypto.pbkdf2(password, salt, 4096, 64, 'sha256', function(err, key) {
		  if (err) { cb(err, null); }
		  cb(null, key.toString('hex'));
		});
	}

	function authenticate(message, cb) {
		console.log('authenticate called')
		User.findOne({email: message.user.email}).select('+password +salt').exec(function(err, user) {
			if (user) {
				get_hash(message.user.password, user.salt, function(err, password) {
					if (user.password === password) {
						console.log('user authenticated');
						cb(null, _.omit(user.toObject(), 'password', 'salt'));
					}
					else {
						cb(null, {warn: 'Authentication Failed'});
					}
				});
			}
			else {
				cb(null, {warn: 'No user was found with that email address'})
			}
		});
	}

	return {
		save: createUser,
		update: updateUser,
		remove: deleteUser,
		read: findById,
		auth: authenticate
	}
}