'use strict';

var utils = require('./utils');

var trim = require('trim');

module.exports = function(persistence, broadcast) {
  var json_attributes = ['username', 'avatarmail', 'ledger', 'vds', 'lastchange'];

  var consumers = {};

  consumers.list = function(req, res) {
    console.log("list Consumers");

    persistence.Consumer.findAll({
      include: [{
        model: persistence.Consumption,
        attributes: [],
      }],
      attributes: json_attributes,
      group: 'consumer.id',
      order: [[persistence.db.fn('COUNT', persistence.db.col('consumptions.id')), 'DESC']],
    }).then(function(consumers) {
      res.json(consumers);
    }).catch(utils.handleError(res));
  };

  consumers.create = function(req, res) {
    console.log("create Consumer");

    //TODO: users may not have the same name as a drinks barcode, this would
    // create issues on the client side.
    console.log("Request body:", req.body);

    if (req.body.username !== trim(req.body.username)) {
      res.status(422);
      res.json({
        message: 'username must not start or end with whitespace'
      });
      return;
    }

    if (req.body.username === "Anon") {
      res.status(422);
      res.json({
        message: '"Anon" is not a valid username'
      });
      return;
    }

    persistence.Consumer.create({
      username: req.body.username, vds: true
    }).then(function(consumer) {
      broadcast.sendEvent( {
        eventtype: 'newuser',
        user: consumer.username
      });

      res.json(utils.filterObject(json_attributes, consumer));
    }).catch(utils.handleError(res));
  };

  consumers.show = function(req, res) {
    console.log("show Consumer");

    persistence.Consumer.findOne({
      where: {username: req.params.username}, attributes: json_attributes
    }).then(function(consumer) {
      if (!consumer) {
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('Not found');
        throw null;
      }

      res.json(consumer);
    }).catch(utils.handleError(res));
  };

  consumers.showHistory = function(req, res) {
    console.log("show Consumer With History");

    persistence.Consumer.findOne({
      where: {username: req.params.username}, attributes: json_attributes,
      include: [{
        model: persistence.Consumption,
        attributes: ['consumetime'],
        where: { consumetime: { $gt: new Date(new Date() - req.params.days * 24 * 60 * 60 * 1000) } },
        required: false,
        include: [{
          model: persistence.Drink,
          attributes: ['name', 'barcode']
        }],
      }]
    }).then(function(consumer) {
      if (!consumer) {
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('Not found');
        throw null;
      }

      var ret = utils.filterObject(json_attributes, consumer);
      ret.logs = consumer.consumptions.map(function(c) {
        return {
          consumetime: c.consumetime,
          username: consumer.username,
          name: c.drink.name,
          barcode: c.drink.barcode,
        };
      });

      res.json(ret);
    }).catch(utils.handleError(res));
  };

  consumers.destroy = function(req, res) {
    console.log("delete Consumer");

    persistence.Consumer.destroy({
      where: {username: req.params.username}
    }).then(function(deleted) {
      res.json({
        message: 'User deleted.'
      });
    }).catch(utils.handleError(res));
  };

  consumers.manipulate = function(req, res) {
    console.log("manipulate Consumer");

    // TODO: validate input

    persistence.Consumer.findOne({
      where: {username: req.params.username}
    }).then(function(consumer) {
      if (!consumer) {
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('Not found');
        throw null;
      }

      if (req.body.avatarmail)
        consumer.avatarmail = req.body.avatarmail;

      if (req.body.vds)
        consumer.vds = req.body.vds;

      return consumer.save().then(function() {
        res.json(utils.filterObject(json_attributes, consumer));
      });
    }).catch(utils.handleError(res));
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
      return;
    }

    persistence.Consumer.findOne({
      where: {username: req.params.username}
    }).then(function(consumer) {
      if (!consumer) {
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('Not found');
        throw null;
      }

      return consumer.increment('ledger', {
        by: amount
      }).then(function() {
        return consumer.reload();
      }).then(function() {
        res.json(utils.filterObject(json_attributes, consumer));
      });
    }).catch(utils.handleError(res));
  }

  return consumers;
};
