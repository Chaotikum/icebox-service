'use strict';

var bonjour = require('bonjour')();
var ip = require('ip');

var app = require('./app');


var port = process.env.PORT || 8081;

app.listen(port, function () {
  var host = app.address;

  bonjour.publish({
    name: 'IceBox',
    type: 'http',
    host: ip.address(),
    port: port
  });

  console.log('Server running on port %d', port);
});
