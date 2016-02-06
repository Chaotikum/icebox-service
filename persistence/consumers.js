var persistence = require('./persistence.js');
var client = persistence.client;

exports.setUpConsumerTable = function() {
  //client.query('DROP TABLE consumer')
  client.query('CREATE TABLE IF NOT EXISTS consumer(id SERIAL PRIMARY KEY, username VARCHAR(200) not null UNIQUE, ledger INTEGER not null, contactmail VARCHAR(254) not null, avatarmail VARCHAR(254), vds BOOLEAN, randomstring VARCHAR(20) not null)');
};

exports.insertNewConsumer = function(username, contactmail, callback) {
  var randomstring = makeid();
  var query = client.query("INSERT INTO consumer(username, ledger, contactmail, avatarmail, vds, randomstring) values($1, $2, $3, $4, $5, $6)  ON CONFLICT DO NOTHING", [username, 0, contactmail, "", true, randomstring]);
  query.on('end', function() {
      callback(username, contactmail, randomstring);
      client.end();
      return;
  });
};

exports.getAllConsumers = function(callback) {
  var results = [];
  var query = client.query("SELECT username, avatarmail, ledger, randomstring FROM consumer ORDER BY username ASC");
  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    callback(results);
  });
};

exports.getConsumersByName = function(username, callback) {
  var results = [];
  var query = client.query("SELECT username, avatarmail, ledger, randomstring FROM consumer WHERE username=($1) ORDER BY username ASC", [username]);
  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    callback(results);
  });
};

exports.getConsumersByNameWithSecret = function(username, randomstring, callback) {
  var results = [];
  var query = client.query("SELECT username, contactmail, avatarmail, ledger, vds FROM consumer WHERE username=($1) AND randomstring=($2) ORDER BY username ASC", [username, randomstring]);
  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    callback(results);
  });
};

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
