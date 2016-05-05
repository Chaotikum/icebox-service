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

module.exports = function(pg, persistence, broadcast) {
  var drinks = {};

  drinks.list = function(req, res) {
    console.log("list Drinks");

    var pool = pg.pools.getOrCreate();
    console.log(showPoolInfo(pool));

    pg.connect(function(err, client, done) {
      console.log("connected");
      if (handleError(err, client, done, res)) return;
      console.log("no error");
      persistence.getAllDrinksByPopularity(client, function(err, drinks) {
        console.log("returns now from stuff");
        if (handleError(err, client, done, res)) return;
        console.log("and again... no error");
        done();
        res.json(drinks);
      });
    });
  };

  drinks.create = function(req, res) {
    console.log("create Drink");

    var drinkdata = {
      name: req.body.name,
      barcode: req.body.barcode,
      fullprice: req.body.fullprice,
      discountprice: req.body.discountprice,
      quantity: req.body.quantity,
      empties: req.body.empties
    };

    pg.connect(function(err, client, done) {
      if (handleError(err, client, done, res)) return;

      persistence.insertNewDrink(client, drinkdata, function(err, drink) {
        if (handleError(err, client, done, res)) return;

        done();
        res.status(201);
        res.json(drink);
      });
    });
  };

  drinks.show = function(req, res) {
    console.log("get Drink");

    var barcode = req.params.barcode;
    pg.connect(function(err, client, done) {
      persistence.getDrinkByBarcode(client, barcode, function(err, drink) {

        done();
        res.json(drink);
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

    pg.connect(function(err, client, done) {
      persistence.updateDrink(client, fullprice, discountprice, barcode, quantity, empties, function(err, drink) {

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

    pg.connect(function(err, client, done) {
      persistence.getDrinkByBarcode(client, barcode, function(err, drink) {
        persistence.deleteDrinkById(client, drink.id);
      });

      done();
      res.end();
    });
  };

  return drinks;
};
