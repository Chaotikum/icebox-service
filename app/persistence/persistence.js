var pg = require('pg');

var iceboxuser = process.env.ICEBOX_DB_USER || 'iceboxuser';
var iceboxpsw = process.env.ICEBOX_DB_PSW || 'testForIce';
var iceboxname = process.env.ICEBOX_DB_NAME || 'icobox';
var iceboxhost = process.env.ICEBOX_DB_HOST || 'localhost';
var iceboxport = process.env.ICEBOX_DB_PORT || 5432;

var connectionString = process.env.ICEBOX_DB_URL ||
  `postgres://${iceboxuser}:${iceboxpsw}@${iceboxhost}:${iceboxport}/${iceboxname}`;

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
