var mongoose = require('mongoose');
var User = require('./user')(mongoose);
mongoose.connect('mongodb://localhost:27017/progress');
var config = require('./config');
var amqp = require('amqp');
var connection = amqp.createConnection(config, { recover: false });
var exhange

<<<<<<< Updated upstream:registration/registration.js
var functions = {
	create: createUser,
	update: updateUser,
	remove: deleteUser,
	read: readUser
};
=======
connection.on('error', function(err) {
	console.log(err.stack);
})
>>>>>>> Stashed changes:users/users.js

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
		var cmd = User[message.cmd];
		if (cmd) {
			cmd(message, function(err, data) {
				cb(err, data);
			});
		}
	}
}