var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var connectionString = process.env.DATABASE_URL || 'postgres://iceboxuser:testForIce@localhost:5432/icobox';

var persis = require('./iceboxpersistence/drinks_persistence.js');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

/*routing.resources(app, controller_dir, "drinks", {}); // last param optional*/

app.put('/drinks/:id', function(req, res) {
    console.log("1-put Drink");
    var drinkId = req.params.id;

    var fullprice = req.body.fullprice;
    var discountprice = req.body.discountprice;
    var quantity = req.body.quantity;

    persis.updateDrink(fullprice, discountprice, drinkId, quantity);

    res.end();
});

app.delete('/drinks/:id', function(req, res) {
    console.log("1-delete Drink");

    var drinkId = req.params.id;

    persis.deleteDrinkById(drinkId);
    res.end();

});

app.get('/drinks/:id', function(req, res) {
  console.log("1-get Drink");
  var drinkId = req.params.id;
  return persis.getDrinkById(drinkId, function(results){
      return res.json(results);
    });
  });

app.get('/drinks', function(req, res) {
  console.log("1-list Drinks");
  var results = persis.getAllDrinks(function(results){
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

    persis.insertNewDrink(name, barcode, fullprice, discountprice);
    res.end();
});

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  updateTables();

  console.log("IceBox listening at http://%s:%s", host, port)
})

function updateTables() {
  updateDepotTables();
  updateDrinkTables();
}

function updateDepotTables() {
  persis.setUpDepotTable();
}

function updateDrinkTables() {
  persis.setUpDrinksTable();
}
