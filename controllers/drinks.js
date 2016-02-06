var persistence = require('../persistence/drinks.js');

exports.list = function(req, res) {
  console.log("list Drinks");

  persistence.getAllDrinks(function(drinks){
    res.json(drinks);
  });
};

exports.create = function(req, res) {
  console.log("create Drink");

  var name = req.body.productname;
  var barcode = req.body.barcode;
  var fullprice = req.body.fullprice;
  var discountprice = req.body.discountprice;

  persistence.insertNewDrink(name, barcode, fullprice, discountprice);

  res.end();
};

exports.show = function(req, res) {
  console.log("get Drink");

  var barcode = req.params.barcode;
  persistence.getDrinkByBarcode(barcode, function(drink){
    res.json(drink);
  });
};

exports.update = function(req, res) {
  console.log("update Drink");

  var barcode = req.params.barcode;
  var fullprice = req.body.fullprice;
  var discountprice = req.body.discountprice;
  var quantity = req.body.quantity;

  persistence.updateDrink(fullprice, discountprice, barcode, quantity);

  res.end();
};

exports.destroy = function(req, res) {
  console.log("destroy Drink");

  var barcode = req.params.barcode;

  persistence.getDrinkByBarcode(barcode, function(drink){
    persistence.deleteDrinkById(drink.id);
  });

  res.end();
};

