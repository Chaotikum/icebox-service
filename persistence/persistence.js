var pg = require('pg');

var connectionString = process.env.ICEBOX_DB_URL || 'postgres://iceboxuser:testForIce@localhost:5432/icobox';

exports.connect = function(callback) {
  pg.connect(connectionString, callback);
};
