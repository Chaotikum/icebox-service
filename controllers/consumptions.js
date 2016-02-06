var persistence = require('../persistence/drinks.js');

exports.create = function(req, res) {
  console.log("create Consumption");

  var barcode = req.body.barcode;
  persistence.consumeDrink(barcode);
  res.end();
};


exports.createWithConsumer = function(req, res) {
  console.log("create Consumption with Consumer");

  var barcode = req.body.barcode;
  persistence.consumeDrink(barcode);

  res.end();

};
