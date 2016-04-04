'use strict';

var bonjour = require('bonjour')();
var ip = require('ip');

var server = require('./server');


var port = process.env.PORT || 8081;

server.listen(port, function () {
  var host = server.address;

  bonjour.publish({
    name: 'IceBox',
    type: 'http',
    host: ip.address(),
    port: port
  });

  console.log('Server running on port %d', port);
});
