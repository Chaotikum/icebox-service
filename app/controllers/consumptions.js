'use strict';

var utils = require('./utils');

module.exports = function(pg, persistence, consumerPersistence, consumptionsPersistence, broadcast) {
  var consumptions = {};

  consumptions.getConsumptionRecords = function(req, res) {
    console.log("get Consumption Record");

    var days = req.params.days;

    console.log("days back: "+days);

    pg.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      consumptionsPersistence.getAllConsumptionRecords(client, days, function(consumptionRecords) {
        done();
        res.status(200);
        res.json(consumptionRecords);
      });
    });
  }

  consumptions.create = function(req, res) {
    console.log("create Consumption");

    var barcode = req.body.barcode;

    pg.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }


      persistence.getDrinkByBarcode(client, barcode, function(err, drink) {
        if (utils.handleError(err, client, done, res)) { return; }
        if (drink.quantity === 0) {
          done();
          res.status(412);
          res.json({
            message: 'According to records this drink is not avaliable.'
          });
        }
        persistence.consumeDrink(client, barcode, function(err, drink) {
          if (utils.handleError(err, client, done, res)) { return; }

          recordConsumptionForUser(client, "Anon", drink);

          consumerPersistence.getConsumersByName(client, "Anon", function(err, consumer) {
          done();

            res.status(201);
            res.json(consumer);
          });
        });
      });
    });
  };


  consumptions.createWithConsumer = function(req, res) {
    console.log("create Consumption with Consumer");

    var username = req.params.username;
    var barcode = req.body.barcode;

    pg.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      persistence.getDrinkByBarcode(client, barcode, function(err, drink) {
        console.log(JSON.stringify(drink));
        consumerPersistence.getConsumersByName(client, username, function(err, consumer) {
          if (utils.handleError(err, client, done, res)) { return; }

          console.log("1 " + JSON.stringify(consumer));
          var price = drink.fullprice;
          if (consumer.ledger > 0) {
            price = drink.discountprice;
          }
          if (consumer.ledger < price) {
            done();
            res.status(402);
            res.json({
              message: 'Insfficient Funds'
            });
          } else {
            if (drink.quantity === 0) {
              done();
              res.status(412);
              res.json({
                message: 'According to records this drink is not avaliable.'
              });
            } else {
              done();
              consumeDrink(res, consumer, drink);
            }
          }
        });
      });
    });
  };

  consumptions.getConsumptionRecordsForUser = function(username, callback) {
    pg.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      consumptionsPersistence.getConsumptionRecordsForUser(client, username, callback);
      done();
    });
  }

  function consumeDrink(res, consumer, drink) {
    console.log("consume drink " + drink.name + " " + consumer.username);

    pg.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      persistence.consumeDrink(client, drink.barcode, function(err, drink) {
        console.log("drink consumed...");
        consumerPersistence.addDeposit(client, consumer.username, drink.discountprice * (-1), function(err, updatedConsumer) {
          console.log("deposit subtracted");
          if (consumer.vds) {
            console.log("...");
            recordConsumptionForUser(client, updatedConsumer.username, drink);
          }
          console.log("before broadcast.");
          broadcast.sendEvent({
            eventtype: 'consumption',
            drink: drink.barcode
          });
          console.log("after broadcast.");
          done();
          res.status(201);
          res.json(updatedConsumer);
        })
      });
    });
  }

  function recordConsumptionForUser(client, username, drink) {
    console.log("recordConsumptionForUser ->" + username + " " + drink.name);

    consumptionsPersistence.recordConsumption(client, username, drink.barcode);

  }

  return consumptions;
};
