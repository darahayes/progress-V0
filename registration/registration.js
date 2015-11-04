var mongoose = require('mongoose');
var User = require('./user')(mongoose);
mongoose.connect('mongodb://localhost:27017/progress');
var config = require('./config');
var amqp = require('amqp');
var connection = amqp.createConnection(config, { recover: false });
var exhange

var functions = {
	save: createUser,
	update: updateUser,
	remove: deleteUser,
	read: readUser
};

//message format {id 1, need: 'users', cmd: 'create', user: {name: 'Darragh', email: 'dara.hayes@email.com'}}
connection.on('ready', function __connectionReady() {
  console.log('Connected to amqp://' + config.login + ':' + config.password + '@' + config.host + '/' + config.vhost);

  // Connect to exchange
  var exchange = connection.exchange(config.exchangeName, config.exchange, function __exchangeReady(exchange) {
    console.log('Exchange \'' + exchange.name + '\' is open');
  });

  var queue = connection.queue('registration', config.queue, function __queueReady(queue) {
    console.log('Queue \'' + queue.name + '\' is open');

    // Bind queue to exchange
    queue.bind(exchange, '', function __bind() {
    });

    queue.subscribe(function __listener(message) {
      // NOTE: if the message was published by another node-amqp client,
      // message will be a plain JS object, if the message is published by other
      // clients it may be received as a Buffer, which you'll need to convert
      // with something like this:
      // message = JSON.parse(message.data.toString('utf8'));
      message = JSON.parse(message.data.toString())
      handleMessage(message, function(err, data) {
      	if (err) { console.log(err); }
      	else {
      		console.log('Command Successful')
      		message.solutions.push(data)
      		console.log(message)
      		exchange.publish('', JSON.stringify(message));
      	}
      });
    });
  });
	// connection.publish('', 'hello')
});

function handleMessage(message, cb) {
	if (message.need && message.need == 'users' && message.solutions.length === 0) {
		//console.log('received message ' + JSON.stringify(message));
		var cmd = functions[message.cmd];
		if (cmd) {
			cmd(message, function(err, data) {
				cb(err, data);
			});
		}
	}
}

function createUser(message, cb) {
	console.log('create user called');
	var user = User(message.user);
	console.log(user);
	user.save(function(err) {
		if (err) { cb(err); }
		console.log('User Created!');
		cb(null, user);
	})
}

function updateUser(message, cb) {
	console.log('update user called');
	var updated = message.user;
	User.findById(message.user._id, function(err, user) {
		if (err) {cb(err)}
		Object.keys(updated).forEach(function(key) {
			user[key] = updated[key];
		});
		user.save(function(err, user) {
			if(err) {cb(err)}
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

function readUser(message, cb) {
	console.log('read user called');
	User.findById(message.user.id, function(err, user) {
		if (err) {cb(err)}
		cb(null, user);
	});
}