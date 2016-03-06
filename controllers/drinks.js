var persistence = require('../persistence/drinks.js');

exports.list = function(req, res) {
  console.log("list Drinks");

  persistence.getAllDrinksByPopularity(function(drinks){
    res.json(drinks);
  });
};

exports.create = function(req, res) {
  console.log("create Drink");

  var name = req.body.productname;
  var barcode = req.body.barcode;
  var fullprice = req.body.fullprice;
  var discountprice = req.body.discountprice;
  var quantity = req.body.quantity;
  var empties = req.body.empties;

  persistence.insertNewDrink(name, barcode, fullprice, discountprice, quantity, empties, function(drink) {
      res.json(drink);
  });
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
  var empties = req.body.empties;

  persistence.updateDrink(fullprice, discountprice, barcode, quantity, empties, function(drink) {

    broadcast.sendEvent({eventtype: 'drinkupdate', drink: drink.barcode});

    res.json(drink)
  });
};

exports.destroy = function(req, res) {
  console.log("destroy Drink");

  var barcode = req.params.barcode;

  persistence.getDrinkByBarcode(barcode, function(drink){
    persistence.deleteDrinkById(drink.id);
  });

  res.end();
};
