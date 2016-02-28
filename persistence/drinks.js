var persistence = require('./persistence.js');
var client = persistence.client;

exports.updateDrink = function(fullprice, discountprice, barcode, quantity) {
  client.query("UPDATE drinks SET fullprice=($1), discountprice=($2), quantity=($4) WHERE barcode=($3)", [fullprice, discountprice, barcode, quantity]);
};

exports.deleteDrinkById = function(drinkId) {
  client.query("DELETE FROM drinks WHERE id=($1)", [drinkId]);
};

exports.getDrinkByBarcode = function(barcode, callback) {
  var query = client.query("SELECT name, barcode, fullprice, discountprice, quantity FROM drinks WHERE barcode=($1) ORDER BY id ASC", [barcode]);
  query.on('row', function(row) {
    callback(row);
  });
};

exports.getAllDrinks = function(callback) {
  var results = [];
  var query = client.query("SELECT name, barcode, fullprice, discountprice, quantity FROM drinks ORDER BY name ASC");
  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    callback(results);
  });
};

exports.insertNewDrink = function(name, barcode, fullprice, discountprice, callback) {
  var query = client.query("INSERT INTO drinks(name, barcode, fullprice, discountprice, quantity) values($1, $2, $3, $4, $5)  ON CONFLICT DO NOTHING", [name, barcode, fullprice, discountprice, 0]);
  query.on('end', function() {
    exports.getDrinkByBarcode(barcode, callback);
  });
};

exports.consumeDrink = function(barcode, callback) {
  var query = client.query("UPDATE drinks SET quantity=(quantity-1) WHERE barcode=($1)", [barcode]);
  query.on('end', function() {
    exports.getDrinkByBarcode(barcode, callback);
  })
};

exports.setUpDrinksTable = function() {
  client.query('CREATE TABLE IF NOT EXISTS drinks(id SERIAL PRIMARY KEY, name VARCHAR(200) not null UNIQUE, barcode VARCHAR(200) not null UNIQUE, fullprice INTEGER not null, discountprice INTEGER not null, quantity INTEGER not null)');
};
