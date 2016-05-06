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
    var username = req.body.username;

    if(username == undefined) {
      createAnonymousConsumtion(res, barcode);
    } else {
      createConsumtionWithUser(res, barcode, username);
    }

  };

 /*
  * DEPRECATED!
  */
  consumptions.createWithConsumer = function(req, res) {
    console.log("create Consumption with Consumer");

    var username = req.params.username;
    var barcode = req.body.barcode;

    if(username == "Anon") {
      createAnonymousConsumtion(res, barcode);
    } else {
      createConsumtionWithUser(res, barcode, username);
    }
  }

  consumptions.getConsumptionRecordsForUser = function(username, callback) {
    pg.connect(function(err, client, done) {
      if (handleError(err, client, done, res)) return;

      consumptionsPersistence.getConsumptionRecordsForUser(client, username, callback);
      done();
    });
  }

  function createAnonymousConsumtion(res, barcode) {
      consumeDrinkIfAvaliable(res, barcode, "Anon", true);
  }


  function createConsumtionWithUser(res, barcode, username) {
    pg.connect(function(err, client, done) {
      if (handleError(err, client, done, res)) return;

      persistence.getDrinkByBarcode(client, barcode, function(err, drink) {

        consumerPersistence.getConsumersByName(client, username, function(err, consumer) {
          if (handleError(err, client, done, res)) return;

          if (consumer.ledger < drink.discountprice) {
            done();
            res.status(402);
            res.json({
              message: 'Insfficient Funds'
            });
          } else {
            done();
            consumeDrinkIfAvaliable(res, barcode, username, false);
          }
        });
      });
    });
  }

  function consumeDrinkIfAvaliable(res, barcode, username, payFullPrice) {
    console.log("consume drink If Avaliable" + barcode + " " + username);

    pg.connect(function(err, client, done) {
      if (handleError(err, client, done, res)) return;

      persistence.getDrinkByBarcode(client, barcode, function(err, drink) {

        if (drink.quantity == 0) {
          done();

          res.status(412);
          res.json({
            message: 'According to records this drink is not avaliable.'
          });
        } else {
          done();
          consumeDrink(res, barcode, username, payFullPrice);
        }
      });
    });
  }

  function consumeDrink(res, barcode, username, payFullPrice) {
      console.log("consume drink " + barcode + " " + username);
      pg.connect(function(err, client, done) {
        if (handleError(err, client, done, res)) return;

        persistence.consumeDrink(client, barcode, function(err, drink) {

        var price = drink.discountprice * (-1);
        if(payFullPrice) {
          price = drink.fullprice * (-1);
        }

        consumerPersistence.addDeposit(client, username, price, function(err, updatedConsumer) {

          if (updatedConsumer.vds) {
            recordConsumptionForUser(client, updatedConsumer.username, drink);
          } else {
            recordConsumptionForUser(client, "Anon", drink);
          }

          broadcast.sendEvent({
            eventtype: 'consumption',
            drink: drink.barcode
          });

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
