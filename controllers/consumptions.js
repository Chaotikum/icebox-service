var persistence = require('../persistence/drinks.js');
var consumerPersistence = require('../persistence/consumers.js');
var consumtionpersistence = require('../persistence/consumtion.js');


exports.getConsumtionRecords = function(req, res) {
  console.log("get Consumtion Record");
  consumtionpersistence.getAllConsumtionRecords(function(consumtionRecords) {
    res.json(consumtionRecords);
  });
}

exports.create = function(req, res) {
  console.log("create Consumption");

  var barcode = req.body.barcode;
  persistence.consumeDrink(barcode, function(drink) {
    recordConsumtion(drink);
  });
  res.end();
};


exports.createWithConsumer = function(req, res) {
  console.log("create Consumption with Consumer");

  var username = req.params.username;
  var barcode = req.body.barcode;

  console.log("1");

  persistence.getDrinkByBarcode(barcode, function(drink) {
    //TODO: how do wen know if the user pays discount or regular?
    // This only works if there is a smallest value (500) in addDeposit
    var price = drink.discountprice;
    console.log(drink.name+" "+price);
    consumerPersistence.getConsumersByName(username, function(consumer) {
      if(consumer.ledger < price) {
        res.status(402);
        res.json({
          message: 'Insfficient Funds'
        });
      }
      consumeDrink(res, consumer, drink);
    });
  });
};

function consumeDrink(res, consumer, drink) {
  persistence.consumeDrink(drink.barcode, function(drink) {
    consumerPersistence.addDeposit(consumer.username, drink.discountprice * (-1), function(updatedConsumer) {
      if(consumer.vds) {
        recordConsumtionForUser(updatedConsumer, drink);
      }
      recordConsumtion(drink);
      res.json(updatedConsumer);
    })
  });
}

function recordConsumtionForUser(consumer, drink) {
  consumtionpersistence.recordConsumtion(consumer.username, drink.barcode);
}


function recordConsumtion(drink) {
//TODO: Anonymous record of a drink being consumed
}
