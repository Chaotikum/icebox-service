var persistence = require('./persistence.js');
var client = persistence.client;

exports.setUpConsumerTable = function() {
  client.query('CREATE TABLE IF NOT EXISTS consumer(id SERIAL PRIMARY KEY, username VARCHAR(200) not null UNIQUE, ledger INTEGER not null VARCHAR(254) not null, avatarmail VARCHAR(254), vds BOOLEAN, randomstring VARCHAR(20) not null)');
};

exports.insertNewConsumer = function(username, callback) {
  var query = client.query("INSERT INTO consumer(username, ledger, avatarmail, vds) values($1, $2, $3, $4) ON CONFLICT DO NOTHING", [username, 0, "", false]);
  query.on('end', function() {
    exports.getConsumersByName(username, callback);
  });
};

exports.getAllConsumers = function(callback) {
  var results = [];
  var query = client.query("SELECT username, avatarmail, ledger, vds FROM consumer ORDER BY username ASC");
  query.on('row', function(row) {
    if (row.username != "Anon") {
      results.push(row);
    }
  });
  query.on('end', function() {
    callback(results);
  });
};

exports.getAllConsumersSortedByConsumption = function(callback) {
  var results = [];
  var query = client.query("SELECT username, avatarmail, ledger, vds " +
  "FROM consumer c1 LEFT OUTER JOIN consumption c2 ON c1.id = c2.consumer_id "+
  "GROUP BY c1.id " +
  "ORDER BY COUNT(consumer_id) DESC");
  query.on('row', function(row) {
    if (row.username != "Anon") {
      results.push(row);
    }
  });

  query.on('end', function() {
    callback(results);
  });
};

exports.getConsumersByName = function(username, callback) {
  console.log("getConsumersByName "+username);
  var query = client.query("SELECT username, avatarmail, ledger, vds FROM consumer WHERE username = ($1) ORDER BY username ASC", [username]);
  query.on('row', function(row) {
    callback(row);
  });
};

exports.deleteConsumerByName = function(username, callback) {
  if(username == "Anon") {
    exports.getConsumersByName(username, callback);
  } else {
  var query = client.query("DELETE FROM consumer WHERE username = ($1)", [username]);
  query.on('end', function() {
    callback();
  });
}
};

exports.manipulateConsumer = function(username, avatarmail, vds, callback) {
  if(username == "Anon") {
    exports.getConsumersByName(username, callback);
  } else {
  var query = client.query("UPDATE consumer SET avatarmail = ($1), vds = ($2) WHERE username = ($3)", [avatarmail, vds, username]);
  query.on('end', function() {
    exports.getConsumersByName(username, callback);
  });
  }
};

exports.addDeposit = function(username, amount, callback) {
  var result = [];
  if(username == "Anon") {
    exports.getConsumersByName(username, callback);
  } else {
    var query = client.query("UPDATE consumer SET ledger = ledger + ($2) WHERE username = ($1)", [username, amount]);
    query.on('end', function() {
      exports.getConsumersByName(username, callback);
    });
  }
};
