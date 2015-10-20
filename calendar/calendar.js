var config = require('./config');
var amqp = require('amqp');
var connection = amqp.createConnection(config, {reconnect: true});
var mongoose = require('mongoose');
var Workout = require('./workout')(mongoose);
mongoose.connect('mongodb://localhost:27017/progress');

console.log('Opening connection to RabbitMQ host...');

connection.on( 'error', function(err) {
  //do something
  console.log('An error occurred\n', err.stack);
  process.exit(0)
});

connection.on('ready', function __connectionReady() {
  console.log('Connected to amqp://' + config.login + ':' + config.password + '@' + config.host + '/' + config.vhost);

  // Connect to exchange
  var exchange = connection.exchange(config.exchangeName, config.exchange, function __exchangeReady(exchange) {
    console.log('Exchange \'' + exchange.name + '\' is open');
  });

  // Setup queue
  var queue = connection.queue('', config.queue, function __queueReady(queue) {
    console.log('Queue \'' + queue.name + '\' is open');

    // Bind queue to exchange
    queue.bind(exchange, '', function __bind() {
      console.log(' [*] Waiting for solutions on the \'' + config.vhost + '\' bus... To exit press CTRL+C');
    });
    // Subscribe to messages on queue
    queue.subscribe(function __listener(message) {
      // NOTE: if the message was published by another node-amqp client,
      // message will be a plain JS object, if the message is published by other
      // clients it may be received as a Buffer, which you'll need to convert
      // with something like this:
      message = JSON.parse(message.data.toString('utf8'));
      handleMessage(message, function(err, data) {
      	console.log(err)
      	console.log(data)
      	if (data) {
      		message.solutions.push(data)
      		console.log('PUBLISHING\n', message)
      		exchange.publish('', JSON.stringify(message))
      	}
      })
    });
  });
});

function handleMessage(message, cb) {
	
	if (message.need && message.need === 'calendar' && message.solutions.length == 0) {
    console.log('\nPERFORMING ACTION WITH MESSAGE\n', message, '\n')
		var cmd = Workout[message.cmd];
		if (cmd) {
			console.log('calling function', message.cmd)
			cmd(message, function(err, data) {
				cb(err, data)
			});
		}
		else {
			cb(Error('cmd not found'))
		}
	}
	else {
		console.log('NOT HANDLING MESSAGE')
    cb();
	}
}
