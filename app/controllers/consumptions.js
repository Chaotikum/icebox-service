'use strict';

var utils = require('./utils');
var Sequelize = require('sequelize');

var Promise = Sequelize.Promise;

module.exports = function(persistence, broadcast) {
  var json_attributes = ['name', 'barcode', 'fullprice', 'discountprice', 'quantity', 'empties'];

  var consumptions = {};

  consumptions.getConsumptionRecords = function(req, res) {
    console.log("get Consumption Record");

    var days = req.params.days;

    console.log("days back: "+days);

    persistence.Consumption.findAll({
      attributes: ['consumetime'],
      where: { consumetime: { $gt: new Date(new Date() - days * 24 * 60 * 60 * 1000) } },
      include: [{
        model: persistence.Consumer,
        attributes: ['username']
      }, {
        model: persistence.Drink,
        attributes: ['name', 'barcode']
      }],
    }).then(function(consumptions) {
      res.json(consumptions.map(function(c) {
        var ret = {
          consumetime: c.consumetime,
          name: c.drink.name,
          barcode: c.drink.barcode,
        };
        if (c.consumer)
          ret.username = c.consumer.username;
        return ret;
      }));
    }).catch(utils.handleError(res));
  }

  consumptions.create = function(req, res) {
    console.log("create Consumption");

    var username = req.body.username;
    var barcode = req.body.barcode;

    lookupAndConsumeDrink(res, barcode, username);
  };

  /*
   * DEPRECATED!
   */
  consumptions.createWithConsumer = function(req, res) {
    console.log("create Consumption with Consumer");

    var username = req.params.username;
    var barcode = req.body.barcode;

    if (username === "Anon")
      username = undefined;

    lookupAndConsumeDrink(res, barcode, username);
  }

  function lookupAndConsumeDrink(res, barcode, username, payFullPrice) {
    console.log("consume drink " + barcode + " " + username);

    var payFullPrice = false;
    if (!username)
      payFullPrice = true;

    var pConsumer = null;

    if (username) {
      pConsumer = persistence.Consumer.findOne({
        where: {username: username}
      });
    }
    var pDrink = persistence.Drink.findOne({
      where: {barcode: barcode}
    });

    Promise.join(pConsumer, pDrink, function(consumer, drink) {
      if (username && !consumer) {
        res.status(422);
        res.json({
          message: 'username not found'
        });
        throw null;
      }
      if (!drink) {
        res.status(422);
        res.json({
          message: 'barcode not found'
        });
        throw null;
      }

      var price;

      if (payFullPrice) {
        price = drink.fullprice;
      }
      else {
        price = drink.discountprice;
      }

      return consumeDrink(res, drink, consumer, price);
    }).catch(utils.handleError(res));
  }

  function consumeDrink(res, drink, consumer, price) {
    return chargeConsumer(
      res, consumer, price
    ).then(function() {
      // Get user to record consumption for
      return getVDSConsumer(consumer);
    }).then(function(vdsConsumer) {
      // Record consumption
      return persistence.Consumption.create({
        consumerId: vdsConsumer,
        drinkId: drink.id,
      });
    }).then(function() {
      broadcast.sendEvent({
        eventtype: 'consumption',
        drink: drink.barcode
      });

      res.status(201);
      res.json(consumer);
    });
  }

  function chargeConsumer(res, consumer, price) {
    if (!consumer)
      return Promise.resolve();

    return persistence.db.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }, function (t) {
      return consumer.decrement('ledger', {
        by: price,
        transaction: t
      }).then(function() {
        return consumer.reload({
          transaction: t
        });
      }).then(function() {
        /* As decrement() is done completely in SQL, Sequelize's validators
         * don't run. Call them explicitly and throw the result to cause a
         * rollback if necessary */
        return consumer.validate();
      }).then(function(err) {
        if (err)
          throw err;
      });
    }).catch(Sequelize.ValidationError, function(err) {
      res.status(402);
      res.json({
        message: 'Insfficient Funds'
      });

      throw null;
    });
  }

  function getVDSConsumer(consumer) {
    if (consumer && consumer.vds) {
      return consumer.id;
    }
    else {
      return null;
    }
  }

  return consumptions;
};
