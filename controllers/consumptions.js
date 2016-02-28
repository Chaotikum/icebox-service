var persistence = require('../persistence/drinks.js');
var consumerPersistence = require('../persistence/consumers.js');
var consumptionpersistence = require('../persistence/consumption.js');


exports.getConsumptionRecords = function(req, res) {
  console.log("get Consumption Record");
  consumptionpersistence.getAllConsumptionRecords(function(consumptionRecords) {
    res.json(consumptionRecords);
  });
}

exports.create = function(req, res) {
  console.log("create Consumption");

  var barcode = req.body.barcode;
  persistence.consumeDrink(barcode, function(drink) {
    recordConsumption(drink);
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
        recordConsumptionForUser(updatedConsumer, drink);
      }
      recordConsumption(drink);
      res.json(updatedConsumer);
    })
  });
}

function recordConsumptionForUser(consumer, drink) {
  consumptionpersistence.recordConsumption(consumer.username, drink.barcode);
}


function recordConsumption(drink) {
//TODO: Anonymous record of a drink being consumed
}

exports.getConsumptionRecordsForUser = function (username, callback) {
  consumptionpersistence.getConsumptionRecordsForUser(username, callback)
}
