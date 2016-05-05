'use strict';

var trim = require('trim');

var utils = require('./utils');

module.exports = function(store, broadcast) {
  var drinks = {};

  drinks.list = function(req, res) {
    console.log("list Drinks");

    store.connect(function(err, client, done) {
      pg.showPoolInfo();
      console.log("connected");
      if (utils.handleError(err, client, done, res)) { return; }
      console.log("no error");

      store.getAllDrinksByPopularity(client, function(err, drinks) {
        console.log("returns now from stuff");
        if (utils.handleError(err, client, done, res)) { return; }
        console.log("and again... no error");
        done();
        pg.showPoolInfo();
        res.json(drinks);
      });
    });
  };

  drinks.create = function(req, res) {
    console.log("create Drink");

    var drinkdata = {
      name: trim(req.body.name),
      barcode: trim(req.body.barcode),
      fullprice: req.body.fullprice,
      discountprice: req.body.discountprice,
      quantity: req.body.quantity,
      empties: req.body.empties
    };

    store.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      store.insertNewDrink(client, drinkdata, function(err, drink) {
        if (err) {
          console.log(err);
          if (err.code === '23505') {
            res.status(422).json({
              error: err.detail,
              message: err.message
            });
            return;
          }
          if (utils.handleError(err, client, done, res)) { return; }
        }

        done();
        res.status(201).json(drink);
      });
    });
  };

  drinks.show = function(req, res) {
    console.log("get Drink");

    var barcode = req.params.barcode;
    store.connect(function(err, client, done) {
      if (utils.handleError(err, client, done, res)) { return; }

      store.getDrinkByBarcode(client, barcode, function(err, drink) {
        if (utils.handleError(err, client, done, res)) { return; }

        done();
        if (drink) {
          res.json(drink);
        } else {
          res.sendStatus(404);
        }
      });
    });
  };

  drinks.update = function(req, res) {
    console.log("update Drink");

    var barcode = req.params.barcode;
    var fullprice = req.body.fullprice;
    var discountprice = req.body.discountprice;
    var quantity = req.body.quantity;
    var empties = req.body.empties;

    store.connect(function(err, client, done) {
      store.updateDrink(client, fullprice, discountprice, barcode, quantity, empties, function(drink) {

        broadcast.sendEvent({
          eventtype: 'drinkupdate',
          drink: drink.barcode
        });

        done();
        res.json(drink);
      });
    });
  };

  drinks.destroy = function(req, res) {
    console.log("destroy Drink");

    var barcode = req.params.barcode;

    store.connect(function(err, client, done) {
      store.getDrinkByBarcode(client, barcode, function(drink) {
        store.deleteDrinkById(client, drink.id);
      });

      done();
      res.end();
    });
  };

  return drinks;
};
