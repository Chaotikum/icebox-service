'use strict';

var utils = require('./utils');

var trim = require('trim');
var Sequelize = require('sequelize');

module.exports = function(persistence, broadcast) {
  var json_attributes = ['name', 'barcode', 'fullprice', 'discountprice', 'quantity', 'empties'];

  var drinks = {};

  drinks.list = function(req, res) {
    console.log("list Drinks");

    persistence.Drink.findAll({
      include: [{
        model: persistence.Consumption,
        attributes: [],
      }],
      attributes: json_attributes,
      group: 'drink.id',
      order: [[persistence.db.fn('COUNT', persistence.db.col('consumptions.id')), 'DESC']],
    }).then(function(drinks) {
      res.json(drinks);
    }).catch(utils.handleError(res));
  };

  drinks.create = function(req, res) {
    console.log("create Drink");

    if (req.body.name !== trim(req.body.name)) {
      res.status(422);
      res.json({
        message: 'name must not start or end with whitespace'
      });
      return;
    }

    if (req.body.barcode !== trim(req.body.barcode)) {
      res.status(422);
      res.json({
        message: 'barcode must not start or end with whitespace'
      });
      return;
    }

    persistence.Drink.create({
      name: req.body.name,
      barcode: req.body.barcode,
      fullprice: req.body.fullprice,
      discountprice: req.body.discountprice,
      quantity: req.body.quantity,
      empties: req.body.empties,
    }).then(function(drink) {
      res.status(201).json(drink);
    }).catch(Sequelize.UniqueConstraintError, function(err) {
      console.error(err);
      res.status(422).json({
        message: err.errors[0].message,
      });
    }).catch(utils.handleError(res));
  };

  drinks.show = function(req, res) {
    console.log("get Drink");

    persistence.Drink.findOne({
      where: {barcode: req.params.barcode}, attributes: json_attributes
    }).then(function(drink) {
      if (!drink) {
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('Not found');
        throw null;
      }

      res.json(drink);
    }).catch(utils.handleError(res));
  };

  drinks.update = function(req, res) {
    console.log("update Drink");

    if (req.body.barcode && req.body.barcode !== trim(req.body.barcode)) {
      res.status(422);
      res.json({
        message: 'barcode must not start or end with whitespace'
      });
      return;
    }

    persistence.Drink.findOne({
      where: {barcode: req.params.barcode}
    }).then(function(drink) {
      if (!drink) {
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('Not found');
        throw null;
      }

      if (req.body.fullprice)
        drink.fullprice = req.body.fullprice;

      if (req.body.discountprice)
        drink.discountprice = req.body.discountprice;

      if (req.body.quantity)
        drink.quantity = req.body.quantity;

      if (req.body.empties)
        drink.empties = req.body.empties;

      return drink.save().then(function() {
        broadcast.sendEvent({
          eventtype: 'drinkupdate',
          drink: drink.barcode
        });

        res.json(utils.filterObject(json_attributes, drink));
      });
    }).catch(utils.handleError(res));
  };

  drinks.destroy = function(req, res) {
    console.log("destroy Drink");

    persistence.Drink.destroy({
      where: {barcode: req.params.barcode}
    }).then(function(deleted) {
      res.json({
        message: 'Drink deleted.'
      });
    }).catch(utils.handleError(res));
  };

  return drinks;
};
