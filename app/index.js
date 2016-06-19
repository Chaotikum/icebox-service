'use strict';

var bodyParser = require('body-parser');
var cors = require('cors');
var express = require('express');
var path = require('path');

var broadcast = require('./broadcast/broadcaster.js');
var persistence = require('./persistence/persistence.js');

var consumersP = require('./persistence/consumers.js');
var consumptionsP = require('./persistence/consumptions.js');
var drinksP = require('./persistence/drinks.js');

var consumers = require('./controllers/consumers.js')(persistence, consumersP, broadcast, consumptionsP);
var consumptions = require('./controllers/consumptions.js')(persistence, drinksP, consumersP, consumptionsP, broadcast);
var drinks = require('./controllers/drinks.js')(persistence, drinksP, broadcast);


var app = express();

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

cors({
  credentials: true,
  origin: true
});
app.use(cors()); // Support cross orgin requests

//Doku
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/../doku/apidoku.html'));
});

// Map routes to controller functions
app.get('/drinks', drinks.list);
app.post('/drinks', drinks.create);
app.get('/drinks/:barcode', drinks.show);
app.put('/drinks/:barcode', drinks.update);
app.delete('/drinks/:barcode', drinks.destroy);

app.get('/consumers', consumers.list);
app.post('/consumers', consumers.create);
app.get('/consumers/:username', consumers.show);
app.get('/consumers/:username/history/:days', consumers.showHistory);
app.post('/consumers/:username/deposit', consumers.addDeposit);
app.put('/consumers/:username/deposit', consumers.setDeposit);
app.delete('/consumers/:username', consumers.destroy);
app.put('/consumers/:username', consumers.manipulate);

app.get('/consumptions/:days', consumptions.getConsumptionRecords);
app.post('/consumptions/:username', consumptions.createWithConsumer);
app.post('/consumptions', consumptions.create);
app.delete('/consumptions', consumptions.undo);

// Export app object
module.exports = app;
