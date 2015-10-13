var config = require('./config');
var amqp = require('amqp');
var connection = amqp.createConnection(config, {reconnect: false});
var mongoose = require('mongoose');
var Exercise = require('./exercise')(mongoose);

mongoose.connect('mongodb://localhost:27017/progress');

connection.on('error', function(e) {
  console.log(e.stack)
})

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
    });

    // Exercise.save_category_or_tag('Test Tag', Tag, {name: 'TEST EXERCISE'}, function(err, data) {
    //   console.log(err, data)
    // })

    // Subscribe to messages on queue
    queue.subscribe(function __listener(message) {
      // NOTE: if the message was published by another node-amqp client,
      // message will be a plain JS object, if the message is published by other
      // clients it may be received as a Buffer, which you'll need to convert
      // with something like this:
      // message = JSON.parse(message.data.toString('utf8'));
      message = JSON.parse(message.data.toString());
      handleMessage(message, function(err, data) {
      	console.log(err)
      	console.log(data)
        if (data) {
          message.solutions.push(data)
          console.log('PUBLISHING\n', message)
          exchange.publish('', JSON.stringify(message))
        }
      });
      console.log(' [x] Received: ' + JSON.stringify(message));
    });
  });
});

function handleMessage(message, cb) {
	
	if (message.need && message.need === 'exercises' && message.solutions.length == 0) {
    console.log('\nPERFORMING ACTION WITH MESSAGE\n', message, '\n')
		var cmd = Exercise[message.cmd];
		if (cmd) {
			cmd(message, function(err, data) {
				cb(err, data);
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
