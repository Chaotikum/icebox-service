var express = require('express');
var bodyParser = require('body-parser');

var consumer_persis = require('./persistence/consumers.js');
var consumption_persis = require('./persistence/consumptions.js');
var depot_persis = require('./persistence/depots.js');

var drinks = require('./controllers/drinks.js');
var consumers = require('./controllers/consumers.js');
var consumptions = require('./controllers/consumptions.js');

var app = express();

app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Map routes to controller functions
app.get('/drinks', drinks.list);
app.post('/drinks', drinks.create);
app.get('/drinks/:barcode', drinks.show);
app.put('/drinks/:barcode', drinks.update);
app.delete('/drinks/:barcode', drinks.destroy);

app.get('/consumer', consumers.list);
app.post('/consumer', consumers.create);
app.get('/consumer/:username', consumers.show);
//TODO: meh, kann man das irgendwie in einem get mit ein oder zwei params je nachdem oder so...
app.get('/consumerWithSecret/:username/:randomsring', consumers.showSecret);

//TODO: pay monney to be added to your account
app.post('/charger', function() {
  var credit = req.body.credit;
  var username = req.body.username;
  //TODO: check that the number is > 0 to acoid trolling
})

//TODO: pay for a drink
app.post('/consumtion/:username', function(req, res) {

})

app.post('/consumption', consumptions.create);


var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("IceBox listening at http://%s:%s", host, port)
})

