var pg = require('pg');

var connectionString = process.env.DATABASE_URL || 'postgres://iceboxuser:testForIce@localhost:5432/icobox';
var client = new pg.Client(connectionString);
client.connect();
exports.client = client;
