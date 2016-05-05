'use strict';

var handleError = function(err, client, done, res) {
  // no error occurred, continue with the request
  if (!err) return false;

  // An error occurred, remove the client from the connection pool.
  if (client) {
    done(client);
  }
  res.writeHead(500, {
    'content-type': 'text/plain'
  });
  res.end('An error occurred');
  console.error("Error handler ran on", err);
  return true;
};

module.exports = function(pg, persistence, consumerPersistence, consumptionsPersistence, broadcast) {
  var consumptions = {};

  consumptions.getConsumptionRecords = function(req, res) {
    console.log("get Consumption Record");

    var days = req.params.days;

    console.log("days back: "+days);

    pg.connect(function(err, client, done) {
      if (handleError(err, client, done, res)) return;

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
      if (handleError(err, client, done, res)) return;

      persistence.getDrinkByBarcode(client, barcode, function(err, drink) {
        if (drink.quantity == 0) {
          done();
          res.status(412);
          res.json({
            message: 'According to records this drink is not avaliable.'
          });
        }
        persistence.consumeDrink(client, barcode, function(drink) {
          recordConsumptionForUser(client, "Anon", drink);

          done();
          res.json(drink);
        });
      });
    });
  };


  consumptions.createWithConsumer = function(req, res) {
    console.log("create Consumption with Consumer");

    var username = req.params.username;
    var barcode = req.body.barcode;

    pg.connect(function(err, client, done) {
      if (handleError(err, client, done, res)) return;

      persistence.getDrinkByBarcode(client, barcode, function(err, drink) {
        console.log(JSON.stringify(drink));
        consumerPersistence.getConsumersByName(client, username, function(err, consumer) {
          if (handleError(err, client, done, res)) return;

          console.log("1 " + JSON.stringify(consumer));
          var price = drink.fullprice;
          if (consumer.ledger > 0) {
            var price = drink.discountprice;
          }
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
    });
  };

  consumptions.getConsumptionRecordsForUser = function(username, callback) {
    pg.connect(function(err, client, done) {
      if (handleError(err, client, done, res)) return;

      consumptionsPersistence.getConsumptionRecordsForUser(client, username, callback);
    });
  }

  function consumeDrink(res, consumer, drink) {
    console.log("consume drink " + drink.name + " " + consumer.username);

    pg.connect(function(err, client, done) {
      if (handleError(err, client, done, res)) return;

      persistence.consumeDrink(client, drink.barcode, function(err, drink) {
        console.log("drink consumed...");
        consumerPersistence.addDeposit(client, consumer.username, drink.discountprice * (-1), function(err, updatedConsumer) {
          console.log("deposit subtracted");
          if (consumer.vds) {
            console.log("...");
            recordConsumptionForUser(client, updatedConsumer.username, drink);
          } else {
            recordConsumptionAnonymous(client, drink);
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

  function recordConsumptionAnonymous(client, drink) {

    consumptionsPersistence.recordConsumption(client, "Anon", drink.barcode);
  }

  return consumptions;
};
