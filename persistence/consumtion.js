var persistence = require('./persistence.js');
var client = persistence.client;

exports.recordConsumtion = function(consumer_id, drink_id) {
  var query = client.query("INSERT INTO consumtion(consumetime, consumer_id, drink_id) values(CURRENT_TIME, $1, $2)", [consumer_id, drink_id]);
  query.on('end', function() {
    client.end();
    return;
  });
};

exports.getAllConsumtionRecords = function(callback) {
  var results = [];
  var query = client.query("SELECT consumer_id, drink_id FROM consumtion ORDER BY consumetime DESC");
  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    callback(results);
  });
};
