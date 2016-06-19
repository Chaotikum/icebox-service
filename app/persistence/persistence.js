var pg = require('pg');

var iceboxuser = process.env.ICEBOX_DB_USER || 'iceboxuser';
var iceboxpsw = process.env.ICEBOX_DB_PSW || 'testForIce';
var iceboxname = process.env.ICEBOX_DB_NAME || 'icobox';

var connectionString = process.env.ICEBOX_DB_URL ||
  `postgres://${iceboxuser}:${iceboxpsw}@localhost:5432/${iceboxname}`;

pg.defaults.poolSize = 20;

exports.connect = function(callback) {
  pg.connect(connectionString, callback);
};

exports.end = function() {
  pg.end();
}

exports.showPoolInfo = function() {
  var pool = pg.pools.getOrCreate(connectionString);
  showPoolInfo(pool);
}

var showPoolInfo = function(pool){
  console.log('poolSize: %d, availableObjects: %d', pool.getPoolSize(), pool.availableObjectsCount());
};
