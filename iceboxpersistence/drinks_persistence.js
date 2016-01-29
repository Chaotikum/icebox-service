var pg = require('pg');

var connectionString = process.env.DATABASE_URL || 'postgres://iceboxuser:testForIce@localhost:5432/icobox';
var client = new pg.Client(connectionString);
client.connect();

exports.test = function () {
  console.log("lol");
};

exports.updateDrink = function(fullprice, discountprice, drinkId, quantity){
  client.query("UPDATE drinks SET fullprice=($1), discountprice=($2), quantity=($4) WHERE id=($3)", [fullprice, discountprice, drinkId, quantity]);
};

exports.deleteDrinkById = function(drinkId){
  client.query("DELETE FROM drinks WHERE id=($1)", [drinkId]);
};

exports.getDrinkById = function(drinkId, callback) {
  var results = [];
  var query = client.query("SELECT id, name, barcode, fullprice, discountprice, quantity FROM drinks WHERE id=($1) ORDER BY id ASC", [drinkId]);
  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    callback(results)
  });
};

exports.getAllDrinks = function(callback) {
  var results = [];
  var query = client.query("SELECT id, name, barcode, fullprice, discountprice, quantity FROM drinks ORDER BY id ASC");
  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    callback(results)
  });
};

exports.insertNewDrink = function(name, barcode, fullprice, discountprice) {
  client.query("INSERT INTO drinks(name, barcode, fullprice, discountprice, quantity) values($1, $2, $3, $4, $5)  ON CONFLICT DO NOTHING", [name, barcode, fullprice, discountprice, 0]);
};

exports.setUpDepotTable = function() {
  client.query('CREATE TABLE IF NOT EXISTS depot(id SERIAL PRIMARY KEY, name VARCHAR(200) not null)');
};

exports.setUpDrinksTable = function() {
  client.query('CREATE TABLE IF NOT EXISTS drinks(id SERIAL PRIMARY KEY, name VARCHAR(200) not null UNIQUE, barcode VARCHAR(200) not null UNIQUE, fullprice INTEGER not null, discountprice INTEGER not null, quantity INTEGER not null)');
};
