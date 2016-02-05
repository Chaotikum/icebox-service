var pg = require('pg');
var client = new pg.Client({
  user: 'iceboxuser',
  password: 'testForIce',
  database: 'icobox'
});

namespace('db', function() {

  desc('Create database');
  task('create', function(){
    console.log('Create database');

    client.connect(function(err) {
      if (err !== null) {
        console.log(err);
      }
    });

    client.query('CREATE TABLE IF NOT EXISTS depot(' +
      'id SERIAL PRIMARY KEY, ' +
      'name VARCHAR(200) not null)');

    client.query('CREATE TABLE IF NOT EXISTS drinks(' +
      'id SERIAL PRIMARY KEY, ' +
      'name VARCHAR(200) not null UNIQUE, ' +
      'barcode VARCHAR(200) not null UNIQUE, ' +
      'fullprice INTEGER not null, ' +
      'discountprice INTEGER not null, ' +
      'quantity INTEGER not null)');

    client.query('CREATE TABLE IF NOT EXISTS consumer(' +
      'id SERIAL PRIMARY KEY, ' +
      'username VARCHAR(200) not null UNIQUE, ' +
      'ledger INTEGER not null, ' +
      'contactmail VARCHAR(254) not null, ' +
      'avatarmail VARCHAR(254), ' +
      'vds BOOLEAN, ' +  
      'randomstring VARCHAR(20) not null)');

    client.on('drain', client.end.bind(client));
  });

  desc('Drop database');
  task('drop', function(){
    console.log('Drop database');

    client.connect(function(err) {
      if (err !== null) {
        console.log(err);
      }
    });

    client.query('DROP TABLE depot')
    client.query('DROP TABLE drinks')
    client.query('DROP TABLE consumer')

    client.on('drain', client.end.bind(client));
  });
//
//  desc('Seed database');
//  task('seed', function() {
//    console.log('Seed database');
//
//    var users = [];
//
//    // Create an array of 100 fake users
//    _.times(100, function() {
//      users.push({
//        username: faker.internet.userName(),
//        email:    faker.internet.email(),
//        password: faker.internet.password()
//      });
//    });
//  });
//
});

