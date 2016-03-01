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

    client.query('CREATE TABLE IF NOT EXISTS drinks (' +
      'id SERIAL PRIMARY KEY, ' +
      'name VARCHAR(200) not null UNIQUE, ' +
      'barcode VARCHAR(200) not null UNIQUE, ' +
      'fullprice INTEGER not null CONSTRAINT positive_fullprice CHECK (fullprice > 0), ' +
      'discountprice INTEGER not null CONSTRAINT positive_disocuntprice CHECK (discountprice > 0 AND fullprice >= discountprice), ' +
      'quantity INTEGER not null CONSTRAINT positive_quantity CHECK (quantity >= 0))');

    client.query('CREATE TABLE IF NOT EXISTS consumer (' +
      'id SERIAL PRIMARY KEY, ' +
      'username VARCHAR(200) not null UNIQUE, ' +
      'ledger INTEGER not null CONSTRAINT positive_ledger CHECK (ledger >= 0), ' +
      'avatarmail VARCHAR(254), ' +
      'vds BOOLEAN)');

    client.query('CREATE TABLE IF NOT EXISTS consumption (' +
      'id SERIAL PRIMARY KEY, ' +
      'consumetime TIMESTAMP DEFAULT current_timestamp, ' +
      'consumer_id SERIAL REFERENCES consumer (id), ' +
      'drink_id SERIAL REFERENCES drinks (id))');

    client.query('INSERT INTO consumer (username, ledger, vds) VALUES (\'Anon\', 0, true)');    

    client.on('drain', client.end.bind(client));
  });

  desc('Example Data');
  task('example', function(){
    console.log('Create Example Data');
    client.connect(function(err) {
      if (err !== null) {
        console.log(err);
      }
    });

    client.query('INSERT INTO consumer (username, ledger, vds) VALUES (\'test1\', 0, true)');
    client.query('INSERT INTO consumer (username, ledger, vds) VALUES (\'test2\', 0, false)');
    client.query('INSERT INTO consumer (username, ledger, vds) VALUES (\'test3\', 50000, true)');
    client.query('INSERT INTO consumer (username, ledger, vds) VALUES (\'test4\', 50000, false)');

    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity) VALUES (\'Limo1\', \'01010101\', 150, 125, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity) VALUES (\'Limo2\', \'01010110\', 150, 125, 200)');

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

    client.query('DROP TABLE consumption')
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
