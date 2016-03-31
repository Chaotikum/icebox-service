'use strict';

var handleError = function(err, client, done, res) {
  // no error occurred, continue with the request
  if(!err) return false;

  // An error occurred, remove the client from the connection pool.
  if(client){
    done(client);
  }
  res.writeHead(500, {'content-type': 'text/plain'});
  res.end('An error occurred');
  console.error("Error handler ran on", err);
  return true;
};

module.exports = function(pg, persistence, broadcast, consumptionsPersistence) {
  var consumers = {};

  consumers.list = function(req, res) {
    console.log("list Consumers");

    // get a pg client from the connection pool
    pg.connect(function(err, client, done) {
      if(handleError(err, client, done, res)) return;

      persistence.getAllConsumersSortedByConsumption(client, function(err, consumers) {
        if(handleError(err, client, done, res)) return;

        done();
        res.json(consumers);
      });
    });
  };

  consumers.create = function(req, res) {
    console.log("create Consumer");

    //TODO: users may not have the same name as a drinks barcode, this would
    // create issues on the client side.
    console.log("Request body:", req.body);

    var userdata = {
      username: req.body.username
    };

    pg.connect(function(err, client, done) {
      if(handleError(err, client, done, res)) return;

      persistence.insertNewConsumer(client, userdata, function(err, consumer) {
        if(handleError(err, client, done, res)) return;

        broadcast.sendEvent( {
          eventtype: 'newuser',
          user: consumer.username
        });

        done();
        res.json(consumer);
      });
    });
  };

  consumers.show = function(req, res) {
    console.log("show Consumer");

    var username = req.params.username;

    pg.connect(function(err, client, done) {
      if(handleError(err, client, done, res)) return;

      persistence.getConsumersByName(client, username, function(err, consumer) {
        if(handleError(err, client, done, res)) return;

        done();
        res.json(consumer);
      });
    });
  };

  consumers.showHistory = function(req, res) {
    console.log("show Consumer With History");

    var username = req.params.username;

    pg.connect(function(err, client, done) {
      if(handleError(err, client, done, res)) return;

      persistence.getConsumersByName(client, username, function(err, consumer) {
        if(handleError(err, client, done, res)) return;

        consumptionsPersistence.getConsumptionRecordsForUser(client, username, function(err, consumptions) {
          if(handleError(err, client, done, res)) return;

          consumer.log = consumptions;

          done();
          res.json(consumer);
        });
      });
    });
  };

  consumers.destroy = function(req, res) {
    console.log("delete Consumer");

    var username = req.params.username;

    pg.connect(function(err, client, done) {
      if(handleError(err, client, done, res)) return;

      persistence.deleteConsumerByName(client, username, function(err) {
        if(handleError(err, client, done, res)) return;

        done();
        res.json({
          message: 'User deleted.'
        });
      });
    });
  };

  consumers.manipulate = function(req, res) {
    console.log("manipulate Consumer");

    var userdata = {
      username: req.params.username,
      avatarmail: req.body.avatarmail,
      vds: req.body.vds
    };

    pg.connect(function(err, client, done) {
      if(handleError(err, client, done, res)) return;

      persistence.manipulateConsumer(client, userdata, function(err, consumer) {
        if(handleError(err, client, done, res)) return;

        done();
        res.json(consumer);
      });
    });
  };

  consumers.addDeposit = function(req, res) {
    console.log("add Deposit");

    var username = req.params.username;
    var amount = req.body.amount;

    console.log("username", username);
    console.log("amount", amount);

    if (amount < 500) {
      console.log("<500");
      res.status(422);
      res.json({
        message: 'Only positive amounts over 500 allowed.'
      });
    }

    pg.connect(function(err, client, done) {
      if(handleError(err, client, done, res)) return;

      persistence.addDeposit(client, username, amount, function(err, consumer) {
        if(handleError(err, client, done, res)) return;

        done();
        res.json(consumer);
      });
    });
  };

  return consumers;
};
