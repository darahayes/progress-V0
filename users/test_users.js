var config = require('./config');
var amqp = require('amqp');
var connection = amqp.createConnection(config, {recover: false});

var cmds = ['create', 'read', 'update', 'remove']

connection.on('ready', function __connectionReady() {
  console.log('Connected to amqp://' + config.login + ':' + config.password + '@' + config.host + '/' + config.vhost);

  // Connect to exchange
  var exchange = connection.exchange(config.exchangeName, config.exchange, function __exchangeReady(exchange) {
    console.log('Exchange \'' + exchange.name + '\' is open');
  });

  // Setup queue
  var queue = connection.queue('', config.queue, function __queueReady(queue) {

    // Bind queue to exchange
    queue.bind(exchange, '')

    createUser(exchange)

    // Subscribe to messages on queue
    queue.subscribe(function __listener(message) {
      // NOTE: if the message was published by another node-amqp client,
      // message will be a plain JS object, if the message is published by other
      // clients it may be received as a Buffer, which you'll need to convert
      // with something like this:
      message = JSON.parse(message.data.toString('utf8'));
      if (message.solutions.length > 0) {
        console.log('received solution\n\n' + JSON.stringify(message))
        
        if (message.cmd === 'save') {
          //soultion to createUser
          var uid = message.solutions[0]._id
          console.log('UID', uid)
          findById(exchange, uid);
        }
        if (message.cmd === 'read') {
          //solution to read
          var user = message.solutions[0]
          user.name = 'Ronan Hayes'
          updateUser(exchange, user);
        }
        if (message.cmd === 'update') {
          //solution to update
          var updated = message.solutions[0]
          authenticate(exchange, {email: 'dara@example.com', password: 'password'});
        }
      }
    });
  });
});


// findById();
// deleteUser();

function createUser(exchange) {
	var cmd = {need: 'users', cmd: 'save', user: {email: 'dara@example.com', name: 'Darragh Hayes', age: 20, gender: 'male', password: 'password'}, solutions: []};
	console.log('\n' + JSON.stringify(cmd));
	exchange.publish('', JSON.stringify(cmd));
}

function findById(exchange, uid) {
	var cmd = {id: 2, need: 'users', cmd: 'read', user: {id: uid}, solutions: []};
	console.log(JSON.stringify(cmd));
	exchange.publish('', JSON.stringify(cmd));
}

function deleteUser(exchange, user) {
		var cmd = {id: 3, need: 'users', cmd: 'remove', user: user, solutions: []};
		console.log(JSON.stringify(cmd));
		exchange.publish('', JSON.stringify(cmd));
}

function updateUser(exchange, updated) {
	var cmd = {id: 3, need: 'users', cmd: 'update', user: updated, solutions: []};
	console.log(JSON.stringify(cmd));
	exchange.publish('', JSON.stringify(cmd));
}

function authenticate(exchange, user) {
  var cmd = {id: 3, need: 'users', cmd: 'auth', user: user, solutions: []}
  console.log(JSON.stringify(cmd));
  exchange.publish('', JSON.stringify(cmd));
}