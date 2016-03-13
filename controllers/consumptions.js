var persistence = require('../persistence/drinks.js');
var consumerPersistence = require('../persistence/consumers.js');
var consumptionpersistence = require('../persistence/consumption.js');
var broadcast = require('../broadcast/broadcaster.js')


exports.getConsumptionRecords = function(req, res) {
  console.log("get Consumption Record");
  consumptionpersistence.getAllConsumptionRecords(function(consumptionRecords) {
    res.json(consumptionRecords);
  });
}

exports.create = function(req, res) {
  console.log("create Consumption");

  var barcode = req.body.barcode;
  console.log("for barcode..."+barcode);
  persistence.getDrinkByBarcode(barcode, function(drink) {
    if (drink.quantity == 0) {
      res.status(412);
      res.json({
        message: 'According to records this drink is not avaliable.'
      });
    }
    console.log("ok, we git the drink, its name is..."+drink.name);
    persistence.consumeDrink(barcode, function(drink) {
      console.log("ok, we are back from consume drink..."+drink.name);
      recordConsumptionForUser("Anon", drink);
      res.json(drink);
    });
  });
};


exports.createWithConsumer = function(req, res) {
  console.log("create Consumption with Consumer");

  var username = req.params.username;
  var barcode = req.body.barcode;

  console.log("1");

  persistence.getDrinkByBarcode(barcode, function(drink) {
    consumerPersistence.getConsumersByName(username, function(consumer) {
      var price = drink.fullprice;
      if (consumer.ledger > 0) {
        var price = drink.discountprice;
      }
      console.log(drink.name + " " + price);
      console.log(consumer.ledger);
      if (consumer.ledger < price && consumer.username != "Anon") {
        res.status(402);
        res.json({
          message: 'Insfficient Funds'
        });
      } else {
        if (drink.quantity == 0) {
          res.status(412);
          res.json({
            message: 'According to records this drink is not avaliable.'
          });
        } else {
          consumeDrink(res, consumer, drink);
        }
      }
    });
  });
};

function consumeDrink(res, consumer, drink) {
  console.log("consume drink " + drink.name + " " + consumer.username);
  persistence.consumeDrink(drink.barcode, function(drink) {
    console.log("1");
    consumerPersistence.addDeposit(consumer.username, drink.discountprice * (-1), function(updatedConsumer) {
      console.log("2");
      if (consumer.vds) {
        console.log("3...");
        console.log("updatedConsumer: "+updatedConsumer.username);
        console.log("drink: "+drink.name)
        recordConsumptionForUser(updatedConsumer.username, drink);
      } else {
        console.log("4...");
        //TODO: Tfis makes no sense and cant happen...
        recordConsumptionAnonymous(drink);
      }
      broadcast.sendEvent({
        eventtype: 'consumption',
        drink: drink.barcode
      });

      res.json(updatedConsumer);
    })
  });
}

function recordConsumptionForUser(username, drink) {
  console.log("recordConsumptionForUser ->" + username + " " + drink.name);
  consumptionpersistence.recordConsumption(username, drink.barcode);
}

function recordConsumptionAnonymous(drink) {
  console.log("4...");
  console.log("recordConsumptionAnon" + drink);
  consumptionpersistence.recordConsumption("Anon", drink.barcode);
}

exports.getConsumptionRecordsForUser = function(username, callback) {
  consumptionpersistence.getConsumptionRecordsForUser(username, callback)
}
