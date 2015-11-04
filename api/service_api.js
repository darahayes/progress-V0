module.exports = function () {

  var config = require('./config')
  var amqp = require('amqp')
  var connection = amqp.createConnection(config, { reconnect: true });
  var uuid = require('node-uuid');
  var exchange

  var connections = {};

  console.log('Opening connection to RabbitMQ host...');

  connection.on( 'error', function(err) {
    //do something
    console.log('An error occurred\n', err.stack);
    process.exit(0)
  });

  connection.on('ready', function __connectionReady() {
    console.log('Connected to amqp://' + config.login + ':' + config.password + '@' + config.host + '/' + config.vhost);

    // Connect to exchange
    exchange = connection.exchange(config.exchangeName, config.exchange, function __exchangeReady(exchange) {
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
        //console.log(' [x] Received: ' + JSON.stringify(message));
        if (message.solutions.length > 0) {
          console.log('MUST REQUEST!');
          var response_callback = connections[message.id];
          console.log(response_callback)
          response_callback(null, message.solutions[0]);
        }
      });
    });
  });

  var calendar = function(msg, cb) {
    msg.need = 'calendar'
    var request_id = uuid.v4();
    msg.id = request_id
    msg.solutions = []
    connections[request_id] = cb
    console.log(connections);
    exchange.publish('', JSON.stringify(msg))
  }

  var users = function(msg, cb) {
    msg.need = 'users'
    var request_id = uuid.v4();
    msg.id = request_id
    msg.solutions = []
    connections[request_id] = cb
    console.log(connections);
    exchange.publish('', JSON.stringify(msg))
  }

  
  return {
    calendar: calendar,
    users: users
  }

}
