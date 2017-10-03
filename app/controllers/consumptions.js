'use strict';

var utils = require('./utils');
var trim = require('trim');

module.exports = function(pg, persistence, consumerPersistence, consumptionsPersistence, broadcast) {
  var consumptions = {};

  consumptions.getConsumptionRecords = function(req, res) {
    console.log("get Consumption Record");

    var days = req.params.days;

    days = parseInt(days, 10);
    if(typeof days==='number' && (days%1)===0) {

      console.log("days back: "+days);

      pg.connect(function(err, client, done) {
        if (utils.handleError(err, client, done, res)) { return; }

        consumptionsPersistence.getAllConsumptionRecords(client, days, function(consumptionRecords) {
          done();
          res.status(200);
          res.json(consumptionRecords);
        });
      });
    } else {
      res.status(400);
      res.json({
        message: 'Not a number'
      });
    }
  }

  consumptions.create = function(req, res) {
    console.log("create Consumption");

    var barcode = trim(req.body.barcode);
    if(req.body.username != undefined) {
      var username = trim(req.body.username);
    }

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

    var username = trim(req.params.username);
    var barcode = req.body.barcode;

    if(username == "Anon") {
      createAnonymousConsumtion(res, barcode);
    } else {
      createConsumtionWithUser(res, barcode, username);
    }
  }

  consumptions.undo = function(req, res) {
    console.log("undo Consmption")

      var consumptionId = req.body.id;
      var username = trim(req.body.username);
      var barcode = trim(req.body.barcode);

      undoConsumption(consumptionId, barcode, username, res);
    }

    consumptions.undoWithPar = function(req, res) {
      console.log("undo Consmption")

        var consumptionId = req.params.id;
        var barcode = trim(req.params.barcode);
        var username = trim(req.params.username);

        undoConsumption(consumptionId, barcode, username, res);
      }

  function undoConsumption(consumptionId, barcode, username, res) {
    pg.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      consumptionsPersistence.removeConsumptionRecord(client, consumptionId, function() {
        persistence.getDrinkByBarcode(client, barcode, function(err, drink) {
          persistence.updateDrink(client, drink.fullprice, drink.discountprice, drink.barcode, (drink.quantity+1), (drink.empties-1), function(err, drink) {
              if(username == "Anon") {
                console.log("-150");
                res.status(201);
              } else {
                console.log("-125");
                consumerPersistence.getConsumersByName(client, username, function(err, consumer) {
                  consumerPersistence.addDeposit(client, username, 125, function(err, updatedConsumer) {
                    res.status(201);
                    res.json(updatedConsumer);
                  });
                });
              }
          });
        });
      });
    });
  }

  consumptions.getConsumptionRecordsForUser = function(username, callback) {
    pg.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      consumptionsPersistence.getConsumptionRecordsForUser(client, username, callback);
      done();
    });
  }

  function createAnonymousConsumtion(res, barcode) {
      consumeDrinkIfAvaliable(res, barcode, "Anon", true);
  }

  function createConsumtionWithUser(res, barcode, username) {
    pg.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      persistence.getDrinkByBarcode(client, barcode, function(err, drink) {

        consumerPersistence.getConsumersByName(client, username, function(err, consumer) {
          if (utils.handleError(err, client, done, res)) { return; }
          if(!consumer || consumer == undefined) {
            return;
          }
          if (consumer.ledger < drink.discountprice) {
            done();
            res.status(402);
            res.json({
              message: 'Insfficient Funds'
            });
          } else {
            consumeDrinkIfAvaliable(res, barcode, username, false);
          }
        });
      });
      done();
    });
  }

  function consumeDrinkIfAvaliable(res, barcode, username, payFullPrice) {
    console.log("consume drink If Avaliable" + barcode + " " + username);

    pg.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      persistence.getDrinkByBarcode(client, barcode, function(err, drink) {

        if (drink.quantity == 0) {
          done();

          res.status(412);
          res.json({
            message: 'According to records this drink is not avaliable.'
          });
        } else {
          consumeDrink(res, barcode, username, payFullPrice);
        }
      });
         done();
    });
  }

 function consumeDrink(res, barcode, username, payFullPrice) {
      console.log("consume drink " + barcode + " " + username);
      pg.connect(function(err, client, done) {
        if (utils.handleError(err, client, done, res)) { return; }

        persistence.consumeDrink(client, barcode, function(err, drink) {

        var price = drink.discountprice * (-1);
        if(payFullPrice) {
          price = drink.fullprice * (-1);
        }

        consumerPersistence.addDeposit(client, username, price, function(err, updatedConsumer) {
          if(payFullPrice) {
            console.log("+150");
          } else {
            console.log("+125");
          }
          if (updatedConsumer.vds) {
            recordConsumptionForUser(res, client, updatedConsumer.username, drink, updatedConsumer, price);
          } else {
            recordConsumptionForUser(res, client, "Anon", drink, updatedConsumer, price);
          }
        })
      });
      done();
    });
  }

  function recordConsumptionForUser(res, client, username, drink, updatedConsumer, price) {
    console.log("recordConsumptionForUser ->" + username + " " + drink.name);
    pg.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      consumptionsPersistence.recordConsumption(client, username, drink.barcode, price, function(undoCode) {

        broadcast.sendEvent({
          eventtype: 'consumption',
          drink: drink.barcode
        });

        done();

        res.status(201);
        //TODO: return undo data.
        undoCode["barcode"]=drink.barcode;
        undoCode["username"]=updatedConsumer.username;
        updatedConsumer["undoparameters"] = undoCode;
        res.json(updatedConsumer);
      });
    });

  }

  return consumptions;
};
