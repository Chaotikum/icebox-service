'use strict';

exports.recordConsumption = function(client, username, barcode) {
  console.log("persistence, record consumptions " + username + " " + barcode);
  var query2 = client.query("SELECT * FROM drinks WHERE barcode = ($1)", [barcode]);
  query2.on('row', function(drink) {
    var query1 = client.query("SELECT * FROM consumers WHERE username = ($1)", [username]);
    query1.on('row', function(consumer) {
      recordConsumptionWithIds(client, consumer.id, drink.id);
    });
  });
};

function recordConsumptionWithIds(client, consumer_id, drink_id) {
  console.log("recordConsumptionWithIds");
  var query = client.query("INSERT INTO consumptions (consumetime, consumer_id, drink_id) values (CURRENT_TIMESTAMP, $1, $2)", [consumer_id, drink_id]);
}

exports.getAllConsumptionRecords = function(client, days, callback) {
  var results = [];

  var d = new Date();
  d.setDate(d.getDate()-days);

  var query = client.query("SELECT consumptions.consumetime, consumers.username, drinks.barcode, drinks.name " +
    "FROM consumptions LEFT OUTER JOIN consumers ON (consumptions.consumer_id = consumers.id) " +
    "LEFT OUTER JOIN drinks ON (consumptions.drink_id = drinks.id) " +
    "WHERE consumptions.consumetime > ($1) " +
    "ORDER BY consumptions.consumetime DESC", [d]);

  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    callback(results);
  });
};

exports.getConsumptionRecordsForUser = function(client, username, days, callback) {
  console.log("consumptions persistence: Get User with record. ");

  var d = new Date();
  d.setDate(d.getDate()-days);

  var query = client.query("SELECT consumptions.consumetime, consumers.username, drinks.barcode, drinks.name " +
    "FROM consumptions " +
    "LEFT OUTER JOIN consumers ON (consumptions.consumer_id = consumers.id) " +
    "LEFT OUTER JOIN drinks ON (consumptions.drink_id = drinks.id) " +
    "WHERE consumers.username = ($1) AND consumptions.consumetime > ($2) " +
    "ORDER BY consumptions.consumetime DESC",
    [username, d]);

  query.on('row', function(row, result) {
    result.addRow(row);
  });
  query.on('error', function(error) {
    callback(error);
  });
  query.on('end', function(result) {
    callback(null, result.rows);
  });
};
