var pg = require('pg');

var connectionString = process.env.ICEBOX_DB_URL || 'postgres://iceboxuser:testForIce@localhost:5432/icobox';

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
