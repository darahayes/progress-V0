var express = require('express');
var bodyParser = require('body-parser')
var api = require('./service_api.js')()
var app = express();

app.use(bodyParser.json())

var server = app.listen(2048, '0.0.0.0', function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at http://%s:%s', host, port);
});

app.get("/calendar", function(req, res) {
	console.log('received calendar request', req.body)
	api.calendar(req.body, function(err, data) {
		console.log('retrieved data\n', data);
		res.send(data)
	});
});

app.post("/user", function(req, res) {
	console.log('received user request', req.body)
	api.users(req.body, function(err, data) {
		console.log('retrieved data\n', data);
		res.send(data)
	});
})