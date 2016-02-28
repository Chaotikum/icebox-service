var persistence = require('./persistence.js');
var client = persistence.client;

exports.recordConsumtion = function(username, barcode) {
  var query1 = client.query("SELECT * FROM consumer WHERE username = ($1)", [username]);
  query1.on('row', function(consumer) {
    var query2 = client.query("SELECT * FROM drinks WHERE barcode = ($1)", [barcode]);
    query2.on('row', function(drink) {
      recordConsumptionWithIds(consumer.id, drink.id);
    });
  });
};

function recordConsumptionWithIds(consumer_id, drink_id) {
  console.log(consumer_id+" "+drink_id);
  var query = client.query("INSERT INTO consumtion (consumetime, consumer_id, drink_id) values(CURRENT_TIMESTAMP, $1, $2)", [consumer_id, drink_id]);
}

exports.getAllConsumtionRecords = function(callback) {
  var results = [];
  //var query = client.query("SELECT * FROM consumtion");

  var query = client.query("SELECT consumtion.consumetime, consumer.username, drinks.barcode, drinks.name " +
    "FROM consumtion LEFT OUTER JOIN consumer ON (consumtion.consumer_id = consumer.id) " +
    "LEFT OUTER JOIN drinks ON (consumtion.drink_id = drinks.id) "+
    "ORDER BY consumtion.consumetime DESC");

  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    callback(results);
  });
};
