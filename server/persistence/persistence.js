var pg = require('pg');

var connectionString = process.env.ICEBOX_DB_URL || 'postgres://iceboxuser:testForIce@localhost:5432/icobox';

pg.defaults.poolSize = 20;

exports.connect = function(callback) {
  pg.connect(connectionString, callback);
};
