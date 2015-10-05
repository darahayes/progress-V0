var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://localhost:2048');

client.on('connect', function () {
  // client.subscribe('presence');
  client.subscribe('progress');
  client.on('message', function(topic, message) {
  	console.log(message.toString())
  })
});
