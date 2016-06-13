'use strict';

var Sequelize = require('sequelize');
var persistence = require('../lib/persistence');

var Promise = Sequelize.Promise;

var Consumer = persistence.Consumer;
var Consumption = persistence.Consumption;
var Drink = persistence.Drink;


namespace('db', function() {
  desc('Create tables');
  task('create', {async: true}, function() {
    console.log('Create tables');

    persistence.db.sync()
      .then(complete);
  });

  desc('Insert seed data');
  task('seed', {async: true}, function() {
    console.log('Insert seed data');

    var p = [];

    p.push(Consumer.bulkCreate([
      {username: 'tvluke', ledger: 375, vds: true},
      {username: 'bülülülüp', ledger: 125, vds: true},
      {username: 'jonnyT', ledger: 250, vds: true},
    ]));

    p.push(Drink.bulkCreate([
      {name: 'viva con Agua laut', barcode: '4027109007880', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'viva con Agua leise', barcode: '4027109007897', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'Sophie Classic', barcode: '4001228512777', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'Sophie Leise', barcode: '4001228512791', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},

      {name: 'flora power', barcode: '4260031874056', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'Mio Mate', barcode: '4002846034504', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'Club Mate', barcode: '4029764001807', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},

      {name: 'Wostok Birne (0.3l)', barcode: '4260189210072', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'Wostok Tanne (0.3l)', barcode: '426018210010', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'Wostok Aprikose (0.3l)', barcode: '4260189210096', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'Wostok Plaume (0.3l)', barcode: '4260189210614', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'Wostok Dattel (0.5l)', barcode: '4260189210041', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'Wostok Grün (0.5l)', barcode: '4260189210065', fullprice: 150, discountprice: 125, quantity: 0, empties: 0},

      {name: 'fritz-kola Kaffee', barcode: '4260107220039', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'fritz-limo Orange', barcode: '4260107220114', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'fritz-limo Zitrone', barcode: '4260107220077', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
      {name: 'fritz-spritz Apfel', barcode: '4260107222514', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},

      {name: 'Premium Cola (0.5l)', barcode: '4260199999999', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},

      {name: 'Müllers Malz', barcode: '4023216000110', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},

      {name: 'Paulaner Hefe', barcode: '4066600641919', fullprice: 150, discountprice: 125, quantity: 200, empties: 0},
    ]));

    Promise.all(p).then(complete);
  });

  desc('Drop database');
  task('drop', {async: true}, function() {
    console.log('Drop tables');

    Promise.each([Consumption, Consumer, Drink], function(table) {
      return table.drop();
    }).then(complete);
  });

});
