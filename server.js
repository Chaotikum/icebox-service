"use strict";

var express = require('express');
var bodyParser = require('body-parser');

var drinks = require('./controllers/drinks.js');
var consumers = require('./controllers/consumers.js');
var consumptions = require('./controllers/consumptions.js');

var app = express();

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

// Map routes to controller functions
app.get('/drinks', drinks.list);
app.post('/drinks', drinks.create);
app.get('/drinks/:barcode', drinks.show);
app.put('/drinks/:barcode', drinks.update);
app.delete('/drinks/:barcode', drinks.destroy);

app.get('/consumers', consumers.list);
app.post('/consumers', consumers.create);
app.get('/consumers/:username', consumers.show);
app.post('/consumers/:username/deposit', consumers.addDeposit);
app.delete('/consumers/:username', consumers.destroy);
app.put('/consumers/:username', consumers.manipulate);

app.get('/consumption', consumptions.getConsumtionRecords);
app.post('/consumption/:username', consumptions.createWithConsumer);
app.post('/consumption', consumptions.create);


var server = app.listen(8081, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("IceBox listening at http://%s:%s", host, port);
});