var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var depot_persis = require('./iceboxpersistence/depot_persistence.js');
var drink_persis = require('./iceboxpersistence/drinks_persistence.js');
var consumer_persis = require('./iceboxpersistence/consumer_persistence.js');
var consumtion_persis = require('./iceboxpersistence/consumtion_persistence.js');

app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

/*routing.resources(app, controller_dir, "drinks", {}); // last param optional*/

app.post('/consumer', function(req, res) {
  console.log("post-consumer");

  var username = req.body.username;
  var contactmail = req.body.contactmail;

  consumer_persis.insertNewConsumer(username, contactmail, function(username, contactmail, randomstring){
    //TODO: send mail to user with his secret string to be used in applications...
    console.log(randomstring);
    res.end();
  });
});

app.get('/consumer', function(req, res) {
  console.log("get-consumer");
  consumer_persis.getAllConsumers(function(results){
      return res.json(results);
  });
});


app.get('/consumer/:username', function(req, res) {
  console.log("get-consumer");

  var username = req.params.username;
  consumer_persis.getConsumersByName(username, function(results){
      return res.json(results);
  });
});

//TODO: meh, kann man das irgendwie in einem get mit ein oder zwei params je nachdem oder so...
app.get('/consumerWithSecret/:username/:randomsring', function(req, res) {
  console.log("get-consumer2");

  var username = req.params.username;
  var randomsring = req.params.randomsring;
  consumer_persis.getConsumersByNameWithSecret(username, randomsring, function(results){
    return res.json(results);
  });
});

//TODO: pay monney to be added to your account
app.post('/charger', function() {
  var credit = req.body.credit;
  var username = req.body.username;
  //TODO: check that the number is > 0 to acoid trolling
})

//TODO: pay for a drink
app.post('/consumtion/:username', function(req, res) {

})

app.post('/consumption', function(req, res) {
  console.log("consume Drink");
  var barcode = req.body.barcode;
  consumtion_persis.consumeDrink(barcode);
  res.end();
});

app.put('/drinks/:barcode', function(req, res) {
  console.log("1-put Drink");
  var barcode = req.params.barcode;

  var fullprice = req.body.fullprice;
  var discountprice = req.body.discountprice;
  var quantity = req.body.quantity;

  drink_persis.updateDrink(fullprice, discountprice, barcode, quantity);

  res.end();
});

app.delete('/drinks/:id', function(req, res) {
  console.log("1-delete Drink");

  var drinkId = req.params.id;

  drink_persis.deleteDrinkById(drinkId);
  res.end();
});

app.get('/drinks/:barcode', function(req, res) {
  console.log("1-get Drink");
  var barcode = req.params.barcode;
  drink_persis.getDrinkByBarcode(barcode, function(results){
      return res.json(results);
    });
  });

app.get('/drinks', function(req, res) {
  console.log("1-list Drinks");
  drink_persis.getAllDrinks(function(results){
      return res.json(results);
  });
});

app.post('/drinks', function(req, res) {
  console.log("1-createDrink");
  var name = req.body.productname;
  var barcode = req.body.barcode;
  var fullprice = req.body.fullprice;
  var discountprice = req.body.discountprice;
  console.log(name);

  drink_persis.insertNewDrink(name, barcode, fullprice, discountprice);
  res.end();
});

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("IceBox listening at http://%s:%s", host, port)
})

