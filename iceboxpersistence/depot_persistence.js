var persistence = require('./persistence.js');
var client = persistence.client;

exports.setUpDepotTable = function() {
  client.query('CREATE TABLE IF NOT EXISTS depot(id SERIAL PRIMARY KEY, name VARCHAR(200) not null)');
};
