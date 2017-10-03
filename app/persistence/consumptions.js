'use strict';

exports.recordConsumption = function(client, username, barcode, payment, callback) {
  console.log("persistence, record consumptions " + username + " " + barcode);
  var query2 = client.query("SELECT * FROM drinks WHERE barcode = ($1)", [barcode]);
  query2.on('row', function(drink) {
    var query1 = client.query("SELECT * FROM consumers WHERE username = ($1)", [username]);
    query1.on('row', function(consumer) {
      recordConsumptionWithIds(client, consumer.id, drink.id, payment, callback);
    });
  });
};

function recordConsumptionWithIds(client, consumer_id, drink_id, payment, callback) {
  console.log("recordConsumptionWithIds "+ payment);
  client.query("INSERT INTO consumptions (consumetime, consumer_id, drink_id, payment) values (CURRENT_TIMESTAMP, $1, $2, $3) RETURNING id", [consumer_id, drink_id, payment],
    function(err, result) {
      if(err) {
        console.log(err);
      } else {
        callback(result.rows[0]);
      }
    }
  );
}

exports.getAllConsumptionRecords = function(client, days, callback) {
  var results = [];

  var d = new Date();
  d.setDate(d.getDate()-days);

  var query = client.query("SELECT consumptions.consumetime, consumers.username, drinks.barcode, drinks.name, consumptions.payment " +
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

  var query = client.query("SELECT consumptions.consumetime, consumers.username, drinks.barcode, drinks.name,  consumptions.payment" +
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

exports.removeConsumptionRecord = function(client, consumptionId, callback) {
  var query = client.query("DELETE FROM consumptions WHERE id=($1)", [consumptionId]);

  query.on('end', function(results) {
    callback();
  });
};
