var http = require('http');


var makeRequest = function(path, data, done) {
  var options = {
    hostname: 'localhost',
    port: 2048,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.toString().length
    }
  }

  var req = http.request(options, function(res) {
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    var response = ''
    res.on('data', function (data) {
      done(null, data);
    });

  });

  req.on('error', function(err) {
    console.log(err);
    done(err);
  });

  //write data to request body
  req.write(data);
  req.end();
};

// var cmd = {cmd: 'history', user: 'dara'}
var cmd0 = {cmd: 'save', user: {name: 'Darragh Hayes', age: 20, gender: 'male', email: 'dara@example.com', password: 'password'}}
// var cmd0 = {cmd: 'auth', user: {email: 'dara@example.com', password: 'password'}}



makeRequest('/user', JSON.stringify(cmd0), function(err, data) {
	console.log(err)
	console.log(data)
})