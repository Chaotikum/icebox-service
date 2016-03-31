'use strict';

exports.getAllConsumers = function(client, callback) {
  var query = client.query(
    "SELECT username, avatarmail, ledger, vds " +
    "FROM consumers " +
    "ORDER BY username ASC");

  query.on('row', function(row, result) {
    // TODO Use config here
    if (row.username != "Anon") {
      result.addRow(row);
    }
  });
  query.on('error', function(error) {
    callback(error);
  });
  query.on('end', function(result) {
    callback(null, result.rows);
  });
};

exports.getAllConsumersSortedByConsumption = function(client, callback) {
  var query = client.query(
    "SELECT username, avatarmail, ledger, vds " +
    "FROM consumers c1 LEFT OUTER JOIN consumptions c2 ON c1.id = c2.consumer_id " +
    "GROUP BY c1.id " +
    "ORDER BY COUNT(consumer_id) DESC");

  query.on('row', function(row, result) {
    // TODO Use config here
    if (row.username != "Anon") {
      result.addRow(row);
    }
  });
  query.on('error', function(error) {
    callback(error);
  });
  query.on('end', function(result) {
    callback(null, result.rows);
  });
};

exports.insertNewConsumer = function(client, data, callback) {
  console.log(data);
  var query = client.query(
    "INSERT INTO consumers (username, ledger, avatarmail, vds) " +
    "VALUES ($1, $2, $3, $4)", [data.username, 0, "", false]);

  query.on('error', function(error) {
    callback(error);
  });
  query.on('end', function(result) {
    exports.getConsumersByName(client, data.username, callback);
  });
};

exports.getConsumersByName = function(client, username, callback) {
  console.log("getConsumersByName " + username);
  console.log("client?" + client);
  var query = client.query(
    "SELECT username, avatarmail, ledger, vds " +
    "FROM consumers " +
    "WHERE username = ($1) ORDER BY username ASC", [username],
    function(err, result) {
      callback(err, result.rows[0]);
    });
};

exports.manipulateConsumer = function(client, data, callback) {
  if (data.username == "Anon") {
    exports.getConsumersByName(client, data.username, callback);
  } else {
    console.log(data.avatarmail);
    console.log(data.vds);
    console.log(data.username);
    var query = client.query("UPDATE consumers SET avatarmail = ($1), vds = ($2) WHERE username = ($3)", [data.avatarmail, data.vds, data.username]);
    query.on('end', function() {
      exports.getConsumersByName(client, data.username, callback);
    });
  }
};

exports.deleteConsumerByName = function(client, username, callback) {
  if (username == "Anon") {
    exports.getConsumersByName(client, username, callback);
  } else {
    var query = client.query(
      "DELETE FROM consumers " +
      "WHERE username = ($1)", [username],
      function(err) {
        callback(err);
      });
  }
};

exports.addDeposit = function(client, username, amount, callback) {
  var result = [];
  if (username == "Anon") {
    exports.getConsumersByName(client, username, callback);
  } else {
    var query = client.query("UPDATE consumers SET ledger = ledger + ($2) WHERE username = ($1)", [username, amount]);
    query.on('end', function() {
      exports.getConsumersByName(client, username, callback);
    });
  }
};
