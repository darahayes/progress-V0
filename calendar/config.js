module.exports = {
  // RabbitMQ connection
  host: 'LOCALHOST',
  vhost: 'progress',
  login: 'progress',
  password: 'progress',

  // Exchange details
  exchangeName: 'rapids',
  exchange: {
    type: 'fanout',
    durable: true,
    autoDelete: false
  },

  // Queue details
  queue: {
    exclusive: true
  }
};
